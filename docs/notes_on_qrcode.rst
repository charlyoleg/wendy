===============
Notes on QRcode
===============


QR-code_ could be useful to advertise a URL_. The site qrcode.com_ provides good technical explanations about *QR-code*.


Installation::

  sudo apt install qrencode


Usage::

  qrencode -tSVG -o netlify_url.svg -s6 -lH https://infallible-brahmagupta-743a4c.netlify.com/
  display netlify_wendy.svg


.. _QR-code: https://en.wikipedia.org/wiki/QR_code
.. _URL: https://en.wikipedia.org/wiki/URL
.. _qrcode.com: https://www.qrcode.com/en/about/version.html
