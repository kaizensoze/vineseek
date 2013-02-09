
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
            async: false,
            dataType: "jsonp",
            beforeSend: function(xhr) {
                $("#loading").css('visibility', 'visible');
                $('#videoTable tr').remove();
            },
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
            },
            complete: function(xhr, status) {
                $("#loading").css('visibility', 'hidden');
            }
        });
    }

    function getVineVideoSrc(vineURL) {
        var proxyURL = "http://localhost:8080/getvine?vineURL=" + encodeURIComponent(vineURL);
        $.ajax({
            url: proxyURL,
            async: false,
            dataType: "jsonp",
            success: function(data) {
                var vineHTML = data.html;
                var vineObj = $(vineHTML);
                var vineVideo = vineObj.find('video')[0];
                var vineVideoSrc = $(vineVideo).find('source').attr('src');
                vines.push(vineVideoSrc);
                // console.log(vineVideoSrc);

                var videoIndex = vines.indexOf(vineVideoSrc);

                addVideoToTable(vineVideoSrc, videoIndex);
            }
        });
    }

    function addVideoToTable(videoSrc, videoIndex) {
        var videoHTML = "";
        videoHTML += '<video autoplay loop>';
        videoHTML += '<source src="'+videoSrc+'"  type="video/mp4" />';
        videoHTML += '</video>';
        // videoHTML = 'blah';

        if (videoIndex % 3 == 1) {
            $('#videoTable').append('<tr></tr>');
        }
        $('#videoTable tr:last').append('<td>'+videoHTML+'</td>');
    }
});
