
var twitterSearchBaseURL = "http://search.twitter.com/search.json";
var twitterSearchURL = twitterSearchBaseURL + "?q=<SEARCHTERM>%20%22vine.co%22%20-filter%3Aretweets";
var nextURL;

var vines = [];

$("document").ready(function() {
    $("#search-term").focus();

    $("#search-term").keydown(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            search();
        }
    });

    $("#search").click(function() {
        search();
    });

    function search(_nextURL) {
        // console.log("search: "+_nextURL);

        var searchURL;
        if (typeof _nextURL !== "undefined") {
            searchURL = twitterSearchBaseURL + nextURL;
        } else {
            var searchTerm = $("#search-term").val();
            searchURL = twitterSearchURL.replace("<SEARCHTERM>", encodeURIComponent(searchTerm));
        }
        $.ajax({
            url: searchURL,
            dataType: "jsonp",
            success: function(data) {
                var vinesOnPage = data['results_per_page'];
                var results = data['results'];
                var next = data['next_page'];

                if (typeof next !== "undefined") {
                    nextURL = next;
                } else {
                    nextURL = undefined;
                }

                $.each(results, function(idx, result) {
                    var tweetText = result['text'];
                    var vineURLPattern = /http:\/\/t\.co\/.*/g;
                    var vineURLMatch = tweetText.match(vineURLPattern)[0];
                    getVineVideoSrc(vineURLMatch);
                });

                // Get next set of vines.
                if (typeof nextURL !== "undefined") {
                    search(nextURL);
                }
            }
        });
    }

    function getVineVideoSrc(vineURL) {
        var proxyURL = "http://localhost:8080/getvine?vineURL=" + encodeURIComponent(vineURL);
        $.ajax({
            url: proxyURL,
            dataType: "jsonp",
            success: function(data) {
                var vineHTML = data.html;
                var vineObj = $(vineHTML);
                var vineVideo = vineObj.find('video')[0];
                var vineVideoSrc = $(vineVideo).find('source').attr('src');
                vines.push(vineVideoSrc);
                console.log(vineVideoSrc);
            }
        });
    }
});
