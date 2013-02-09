import urllib2

vine_url = "http://vine.co/v/bn11uDxlzev"
vine_url_response = urllib2.urlopen(vine_url)
vine_page_html = vine_url_response.read()
json_response = {'html': vine_page_html}
blah = ''.join(['bloop', '(', str(json_response), ')'])
print(blah)