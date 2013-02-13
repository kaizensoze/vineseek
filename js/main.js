
var twitterSearchBaseURL = "http://search.twitter.com/search.json";
var twitterSearchURL = twitterSearchBaseURL + "?q=<SEARCHTERM>%20%22vine.co%22%20-filter%3Aretweets";
var nextURL;

var vines = [];

var initialSearch;
var requestCap;
var requests = 0;

$("document").ready(function() {
    $("#search-term").focus();

    $("#search-term,#num-vines").keydown(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            initSearch();
        }
    });

    $("#search").click(function() {
        initSearch();
    });

    function initSearch() {
        initialSearch = true;
        requestCap = $('#num-vines').val() || 20;
        search();
    }

    function search(_nextURL) {
        // console.log("search: "+_nextURL);

        var searchURL;
        if (typeof _nextURL !== "undefined") {
            searchURL = twitterSearchBaseURL + nextURL;
        } else {
            var searchTerm = $("#search-term").val();
            searchURL = twitterSearchURL.replace("<SEARCHTERM>", encodeURIComponent(searchTerm));
        }

        // console.log(searchURL);

        $.ajax({
            url: searchURL,
            async: false,
            dataType: "jsonp",
            beforeSend: function(xhr) {
                $("#loading").css('visibility', 'visible');
                if (initialSearch) {
                    $('#videoTable tr').remove();
                    requests = 0;
                }
                initialSearch = false;
            },
            success: function(data) {
                $("#loading").css('visibility', 'hidden');

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
                    var vineURLMatches = tweetText.match(vineURLPattern);
                    if (vineURLMatches.length > 0) {
                        getVineVideoSrc(vineURLMatches[0]);
                        requests++;
                    }
                });

                // Get next set of vines.
                if (typeof nextURL !== "undefined" && requests < requestCap) {
                    search(nextURL);
                }
            }
        });
    }

    function getVineVideoSrc(vineURL) {
        if (requests >= requestCap) {
            return;
        }

        var proxyURL = "run.php?action=getvine&vineurl=" + encodeURIComponent(vineURL);

        $.ajax({
            url: proxyURL,
            async: false,
            dataType: "jsonp",
            success: function(data) {
                var vineHTML = decodeURIComponent(data.html);
                var vineObj = $(vineHTML);
                var vineVideo = vineObj.find('video')[0];
                var vineVideoSrc = $(vineVideo).find('source').attr('src');
                var vineVideoType = $(vineVideo).find('source').attr('type');
                vines.push(vineVideoSrc);

                var videoIndex = vines.indexOf(vineVideoSrc);

                addVideoToTable(vineVideoSrc, vineVideoType, videoIndex);
            }
        });
    }

    function addVideoToTable(videoSrc, videoType, videoIndex) {
        var videoHTML = "";
        videoHTML += '<video autoplay loop>';
        videoHTML += '<source src="'+videoSrc+'"  type="'+videoType+'" />';
        videoHTML += '</video>';

        if (videoIndex % 4 == 0) {
            $('#videoTable').append('<tr></tr>');
        }
        $('#videoTable tr:last').append('<td>'+videoHTML+'</td>');
    }
});
