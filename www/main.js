$(function () {
    function post(URL, PARAMS) {
        var temp = document.createElement("form");
        temp.action = URL;
        temp.method = "post";
        temp.style.display = "none";
        for (var x in PARAMS) {
            var opt = document.createElement("textarea");
            opt.name = x;
            opt.value = PARAMS[x];
            // alert(opt.name)
            temp.appendChild(opt);
        }
        document.body.appendChild(temp);
        temp.submit();
        return null;
    }

    function transform(strokes) {
        for (var i = 0; i < strokes.length; ++i)
            for (var j = 0, stroke = strokes[i]; j < stroke.length; ++j)
                strokes[i][j] = [strokes[i][j][0], strokes[i][j][1]];
        return strokes;
    }


    function urlParam(name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(top.window.location.href);
        return (results !== null) ? results[1] : undefined;
    };

    var $canvas = $('#drawing-canvas').sketchable({
        graphics: {
            strokeStyle: "black",
            firstPointSize: 0.5,
            lineWidth: 3,
            // lineJoin: "round",
            lineCap: "round"
        }
    });

    function clearStrokes() {
        $canvas.sketchable('clear');
        $('.result').empty();
    };

    function submitStrokes() {
        //var $submit = $('a#send'), $latex = $('#eq-latex'), $render = $('#eq-render');
        var strokes = $canvas.sketchable('strokes');
        console.log(strokes);
        // Submit strokes in the required format.
        //strokes = transform(strokes);
        //traces = [];
        //for (var i = 0; i < strokes.length; ++i)
        //    traces.append(strokes[i])
        //post('http://192.168.46.123:8900/send_pts/', {"user" :"hyer", "traces":traces});
        var submit_sync = function () {
            $.ajax({
                type: 'POST',
                url: "http://192.168.46.123:8900/send_pts/",
                //contentType: "application/json; charset=utf-8",  //# 不需要！！！
                dataType: "json",  // 这一条表示返回值的类型，不必须，且依据返回值类型而定。
                async: true,
                crossDomain:true,
                // 1 需要使用JSON.stringify 否则格式为 a=2&b=3&now=14...
                // 2 需要强制类型转换，否则格式为 {"a":"2","b":"3"}
                data: JSON.stringify({"traces" : strokes}),

                success: function (jsonResult) {
                    alert(jsonResult);
                }
            });
        }
        submit_sync();


        // var postdata = {strokes: JSON.stringify(strokes)};
        // if (urlParam("train")) {
        //     postdata.label = $('#train').val();
        //     postdata.user = urlParam("user");
        // }
        // $.ajax({
        //     url: "eq.php",
        //     type: "POST",
        //     data: postdata,
        //     beforeSend: function (xhr) {
        //
        //         // $submit.hide(); // send 按鈕
        //         var loading = '<div id="loading"> \
        //                   <h2 class="inline">Sending...</h2> \
        //                   <h4>This might take a while.</h4> \
        //                  </div>';
        //         $('.eq').prepend(loading);
        //         $latex.empty();
        //         $render.empty();
        //     },
        //     error: function (jqXHR, textStatus, errorThrown) {
        //         $('.eq').html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
        //     },
        //     success: function (data, textStatus, jqXHR) {
        //
        //         // $submit.show();
        //         $('#loading').remove();
        //         if (!data) {
        //             $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
        //             return false;
        //         }
        //
        //         var asurl = encodeURIComponent(data);
        //         var query = '<p id="query">Search this in \
        //             <a target="_blank" href="https://www.google.es/search?q=' + asurl + '">Google</a> \
        //             or in <a target="_blank" href="https://www.wolframalpha.com/input/?i=' + asurl + '">Wolfram|Alpha</a>.';
        //         $latex.html(data + '<br/>' + query);
        //         $render.html('\\[' + data + '\\]');
        //         MathJax.Hub.Typeset();
        //     }
        // });
        return true;
    }

    $('a#clear').on("click", function (e) {
        e.preventDefault();
        clearStrokes();
    });

    $('a#send').on("click", function (e) {
        e.preventDefault();
        submitStrokes();
    });

    $('a#undo').on("click", function (e) {
        e.preventDefault();
        $canvas.sketchable('undo');
    });

    $('a#redo').on("click", function (e) {
        e.preventDefault();
        $canvas.sketchable('redo');
    });



    $('#clear').click(function (e) {
        e.preventDefault();
        clearStrokes();
    });
    //$("#myButton").click(function(){
    //        $(this).button('loading').delay(1000).queue(function() {
    //            $(this).button('complete');
    //            $(this).dequeue();
    //        });
    //});



    if (urlParam("train")) {
        // Shortcut to clear canvas + submit strokes.
        $(document).on("keydown", function (e) {
            //if (e.ctrlKey && e.which == 65) { // This can be exhausting.
            if (e.which == 45 || e.which == 96) { // Better be pressing a single key, e.g. INS.
                e.preventDefault();
                submitStrokes();
                clearStrokes();
            }
        });
    }

    // Render LaTeX math expressions on page load.
    MathJax.Hub.Config({showMathMenu: false});
    MathJax.Hub.Typeset();
});
