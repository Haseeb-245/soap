const proxy = 'https://cors-anywhere.herokuapp.com/';
const endpoints = {
  calculator: 'http://www.dneonline.com/calculator.asmx',
  temp: 'https://www.w3schools.com/xml/tempconvert.asmx',
  country: 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso',
  number: 'https://www.dataaccess.com/webservicesserver/numberconversion.wso'
};

// Tab switching
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('visible'));
    document.getElementById(btn.dataset.tab).classList.add('visible');
  });
});

function setResult(id, text) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.add('show');
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

// Calculator
document.getElementById('calc-btn').addEventListener('click', async () => {
  const a = document.getElementById('calc-a').value;
  const b = document.getElementById('calc-b').value;
  const soap = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <Add xmlns="http://tempuri.org/">
          <intA>${escapeXml(a)}</intA>
          <intB>${escapeXml(b)}</intB>
        </Add>
      </soap:Body>
    </soap:Envelope>`;
  const res = await fetch(proxy + endpoints.calculator, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'http://tempuri.org/Add' },
    body: soap
  });
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  setResult('calc-result', 'Result: ' + xml.getElementsByTagName('AddResult')[0].textContent);
});

// Temperature Conversion
document.getElementById('temp-btn').addEventListener('click', async () => {
  const val = document.getElementById('temp-val').value;
  const dir = document.getElementById('temp-dir').value;
  const op = dir === 'CtoF' ? 'CelsiusToFahrenheit' : 'FahrenheitToCelsius';
  const param = dir === 'CtoF' ? 'Celsius' : 'Fahrenheit';
  const ns = 'https://www.w3schools.com/xml/';
  
  const soap = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <${op} xmlns="${ns}">
          <${param}>${escapeXml(val)}</${param}>
        </${op}>
      </soap:Body>
    </soap:Envelope>`;
  
  const res = await fetch(proxy + endpoints.temp, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': `${ns}${op}` },
    body: soap
  });
  
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  setResult('temp-result', 'Result: ' + xml.getElementsByTagName(`${op}Result`)[0].textContent);
});

// Country Capital
document.getElementById('country-btn').addEventListener('click', async () => {
  const code = document.getElementById('country-code').value.trim().toUpperCase();
  const soap = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <CapitalCity xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>${escapeXml(code)}</sCountryISOCode>
        </CapitalCity>
      </soap12:Body>
    </soap12:Envelope>`;
  
  const res = await fetch(proxy + endpoints.country, {
    method: 'POST',
    headers: { 'Content-Type': 'application/soap+xml; charset=utf-8', 'SOAPAction': '' },
    body: soap
  });
  
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const node = xml.getElementsByTagName('m:CapitalCityResult')[0] || xml.getElementsByTagName('CapitalCityResult')[0];
  setResult('country-result', 'Capital: ' + (node ? node.textContent : 'Not found'));
});

// Number to Words
document.getElementById('num-btn').addEventListener('click', async () => {
  const n = document.getElementById('num-val').value;
  const soap = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <NumberToWords xmlns="http://www.dataaccess.com/webservicesserver/">
          <ubiNum>${escapeXml(n)}</ubiNum>
        </NumberToWords>
      </soap:Body>
    </soap:Envelope>`;
  
  const res = await fetch(proxy + endpoints.number, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'http://www.dataaccess.com/webservicesserver/NumberConversion.wso/NumberToWords' },
    body: soap
  });
  
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const node = xml.getElementsByTagName('m:NumberToWordsResult')[0] || xml.getElementsByTagName('NumberToWordsResult')[0];
  setResult('num-result', node ? node.textContent : 'Not found');
});
