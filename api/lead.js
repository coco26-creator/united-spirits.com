/**
 * Vercel Node.js serverless function for distributor and supplier enquiries.
 * Configure secrets in Vercel Project Settings > Environment Variables.
 */
const KLAVIYO_REVISION = '2026-07-15';
const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.unitedspiritshk.com',
  'https://unitedspiritshk.com',
];

function json(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

function getAllowedOrigins() {
  const configured = (process.env.ALLOWED_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

async function klaviyoPost(path, payload, apiKey) {
  const response = await fetch('https://a.klaviyo.com/api/' + path.replace(/^\/+/, ''), {
    method: 'POST',
    headers: {
      Authorization: 'Klaviyo-API-Key ' + apiKey,
      accept: 'application/vnd.api+json',
      'content-type': 'application/vnd.api+json',
      revision: KLAVIYO_REVISION,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  let result = {};
  try { result = body ? JSON.parse(body) : {}; } catch (_) { /* non-JSON error body */ }
  if (!response.ok) {
    console.error('Klaviyo API request failed', { path, status: response.status, body: body.slice(0, 600) });
    throw new Error('Klaviyo could not save this enquiry (HTTP ' + response.status + ').');
  }
  return result;
}

async function sendNotification({ type, email, fields, clean }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.NOTIFICATION_EMAIL || 'info@unitedspiritshk.com';
  if (!apiKey || !from || !to) throw new Error('Email notification is not configured.');
  const lines = [
    'A new ' + type + ' enquiry was submitted on unitedspiritshk.com.',
    '',
    'Contact email: ' + email,
    ...fields.map(([key, label]) => label + ': ' + clean[key]),
    '',
    'Consent to respond to this enquiry: Yes',
  ];
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: 'Website ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Enquiry',
      text: lines.join('\n'),
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error('Email notification provider failed', { status: response.status, body: body.slice(0, 600) });
    throw new Error('Email notification could not be sent (HTTP ' + response.status + ').');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, message: 'Method not allowed.' });
  }

  const origin = req.headers.origin;
  if (origin && !getAllowedOrigins().includes(origin)) {
    return json(res, 403, { ok: false, message: 'Request origin is not allowed.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : null;
  if (!body || Buffer.byteLength(JSON.stringify(body), 'utf8') > 20000) {
    return json(res, 400, { ok: false, message: 'Please check the form and try again.' });
  }

  // Honeypot: silently accept automated submissions without processing them.
  if (typeof body.website === 'string' && body.website.trim()) {
    return json(res, 200, { ok: true, message: 'Thank you. Your enquiry has been received.' });
  }

  const type = body.type;
  if (!['distributor', 'supplier'].includes(type)) {
    return json(res, 400, { ok: false, message: 'Unknown enquiry type.' });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 422, { ok: false, message: 'Please enter a valid email address.' });
  }
  if (body.contact_consent !== 'yes') {
    return json(res, 422, { ok: false, message: 'Please confirm that we may use these details to respond to your enquiry.' });
  }

  const fields = type === 'distributor'
    ? [
        ['company_name', 'Company name'],
        ['country_region', 'Country/region'],
        ['distribution_channels', 'Distribution channels'],
        ['annual_volume_cases', 'Annual volume (cases)'],
      ]
    : [
        ['winery_distillery_name', 'Winery/distillery name'],
        ['country', 'Country'],
        ['product_type', 'Product type'],
        ['production_capacity', 'Production capacity'],
        ['certifications', 'Certifications'],
      ];

  const clean = {};
  for (const [key, label] of fields) {
    const value = body[key] === undefined || body[key] === null ? '' : String(body[key]).trim();
    if (!value || value.length > 3000) {
      return json(res, 422, { ok: false, message: 'Please complete the required field: ' + label + '.' });
    }
    clean[key] = value;
  }
  if (type === 'distributor' && (!Number.isFinite(Number(clean.annual_volume_cases)) || Number(clean.annual_volume_cases) < 0)) {
    return json(res, 422, { ok: false, message: 'Please enter a valid annual case volume.' });
  }

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env[type === 'distributor' ? 'KLAVIYO_DISTRIBUTOR_LIST_ID' : 'KLAVIYO_SUPPLIER_LIST_ID'];
  const emailApiKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM;
  if (!apiKey || !listId || !emailApiKey || !mailFrom) {
    console.error('Lead endpoint configuration is incomplete.');
    return json(res, 503, {
      ok: false,
      message: 'The enquiry service is temporarily unavailable. Please email info@unitedspiritshk.com directly.',
    });
  }

  const properties = {
    lead_type: type,
    contact_consent: true,
    enquiry_source: 'United Spirits HK website',
    ...clean,
  };

  try {
    // Store/update the profile, then add it to the chosen list. This does not
    // automatically grant email-marketing subscription status.
    const profile = await klaviyoPost('profile-import', {
      data: {
        type: 'profile',
        attributes: { email },
        properties,
      },
    }, apiKey);
    const profileId = profile?.data?.id;
    if (!profileId) throw new Error('Klaviyo did not return a profile ID.');
    await klaviyoPost('lists/' + encodeURIComponent(listId) + '/relationships/profiles', {
      data: [{ type: 'profile', id: profileId }],
    }, apiKey);
  } catch (error) {
    console.error('Klaviyo lead save failed', { type, message: error.message });
    return json(res, 502, {
      ok: false,
      message: 'We could not record your enquiry just now. Please try again or email info@unitedspiritshk.com.',
    });
  }

  try {
    await sendNotification({ type, email, fields, clean });
  } catch (error) {
    console.error('Lead saved to Klaviyo but email notification failed', { type, message: error.message });
    return json(res, 502, {
      ok: false,
      message: 'Your enquiry was recorded, but our email notification failed. Please email info@unitedspiritshk.com and mention your enquiry.',
    });
  }

  return json(res, 200, { ok: true, message: 'Thank you. Your enquiry has been sent to our team.' });
}
