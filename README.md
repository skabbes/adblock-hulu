# Adblock Hulu
Adblock-hulu is a firefox addon experiment playing with request / response manipulation.  It aims to disable Hulu ads.

## Try it out
A recent version of adblock-hulu is usually available [here](http://skpics.com/adblock-hulu/adblock-hulu.xpi).

## How it works
By listening to traffic on Hulu's webpage, we can inject our own ads into hulu's stream.  I have custom tailored a blank flv file to replace Hulu ads with.  This effectivly makes the ads 0-length, and is very quick to "finish".

## Known drawbacks
Interactive flash ads use a different mechanism to determine how long you have to watch the ad - as far as I can tell, it is an XML file which tags along with the actual swf.  However, these are rare making them difficult to test.

### Disclaimer
This code is *only* for demonstrating the programatic request / response manipulation provided by the firefox addon api's.
Using this addon to circumvent Hulu ads is a violation of Hulu's [terms of service](http://www.hulu.com/terms).


