==============
Wendy's README
==============


Presentation
============

Wendy_ is a small website, intended to run on small_ and local instances, for enabling the germination of `web of trust`_.

*Wendy* consists of a big front-end and a small back-end.

The front-end features are:

- generate a key-pair_
- create social profile
- emit a signed digital identity
- certify signed digital identities from peers
- gather and organized the self-certified digital identities from peers
- share the certified digital identities
- analyze the *web of trust*


The back-end eases the data exchange between the peers.

.. _Wendy : https://github.com/charlyoleg/wendy
.. _small : https://www.raspberrypi.org/
.. _`web of trust` : https://en.wikipedia.org/wiki/Web_of_trust
.. _key-pair : https://en.wikipedia.org/wiki/Public-key_cryptography


Getting started
===============

In a bash-terminal::

  git clone https://github.com/charlyoleg/wendy
  cd wendy
  npm i
  npm run start


Public instance
===============

Wendy's frontend is available on Netlify_.

.. _Netlify : https://infallible-brahmagupta-743a4c.netlify.com/


Documentation
=============

You can browse the documentation on readthedocs_ or build it locally::

  git clone https://github.com/charlyoleg/wendy
  cd wendy
  npm install
  npm run install_py
  npm run the_docs

.. _readthedocs : https://wendy.readthedocs.io/en/latest/

