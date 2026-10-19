#!/usr/bin/env node
// Lightweight static checks for the lead endpoint and form wiring.
const fs = require('fs');
const assert = require('assert');
const index = fs.readFileSync('index.html', 'utf8');
const endpoint = fs.readFileSync('api/lead.js', 'utf8');
const distributor = fs.readFileSync('sections/distributor.html', 'utf8');
const supplier = fs.readFileSync('sections/supplier.html', 'utf8');
assert(index.includes("fetch('/api/lead'"), 'frontend must post to the Vercel API endpoint');
assert(index.includes('form.dataset.leadType'), 'frontend must select endpoint only for designated forms');
assert(endpoint.includes('KLAVIYO_PRIVATE_API_KEY'), 'Klaviyo API key must be server-side');
assert(endpoint.includes('relationships/profiles'), 'endpoint must add profile to configured list');
assert(endpoint.includes('api.resend.com/emails'), 'endpoint must send an email notification');
assert(endpoint.includes('return json(res, 502'), 'endpoint must report backend failures');
assert(!endpoint.includes('sk_test_') && !endpoint.includes('pk_test_'), 'no placeholder credentials should be present');
assert(distributor.includes('data-lead-type="distributor"') && distributor.includes('name="contact_consent"'), 'distributor form needs type and consent');
assert(supplier.includes('data-lead-type="supplier"') && supplier.includes('name="contact_consent"'), 'supplier form needs type and consent');
assert(distributor.includes('name="website"') && supplier.includes('name="website"'), 'both forms need honeypot');
console.log('Lead form static checks passed.');
