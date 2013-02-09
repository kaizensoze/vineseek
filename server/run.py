import urllib2
from bottle import route, request, response, run

@route('/getvine')
def getvine():
    vine_url = request.query.get('vineURL')
    vine_url_response = urllib2.urlopen(vine_url)
    vine_page_html = vine_url_response.read()
    json_response = {'html': vine_page_html}

    callback_function = request.query.get('callback')
    if callback_function:
        json_response = ''.join([callback_function, '(', str(json_response), ')'])
        response.content_type = 'application/x-javascript'

    return json_response

run(host='localhost', port=8080, debug=True)