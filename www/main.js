$(function () {
    // function tishi(mess){
    //     $('#overlay').fadeIn('fast', function () {
    //         $('#box').animate({ 'top': '150px' }, 500);
    //         $("#mess").html(mess);
    //         setTimeout("tishiclose()",2000);//2秒消失，可以改动
    //
    //     });
    // }
    //
    // function tishiclose(){
    //     $('#box').animate({ 'top': '-500px' }, 500, function () {
    //         $('#overlay').fadeOut('fast');
    //     });
    // }



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
    }

    function renderGTLatex() {
        var $render_gt = $('#eq-gt-render');
        latex_str_gt = $('#latex_gt_str').val();
        $render_gt.html('\\[' + latex_str_gt + '\\]');
        MathJax.Hub.Typeset();
    }
    
    function showBbox() {
        for (var i = 0; i < 1; ++i) {
            $("#sym1").toggle();
        }
    }

    function submitStrokes() {
        var $latex = $('#eq-latex');
        var $render = $('#eq-render');
        var strokes = $canvas.sketchable('strokes');
        var pack_traces = new Array();
        console.log(strokes);

        algo_type = $("input[type='radio']:checked").val();
        // console.log(algo_type);
        if (algo_type == 'det_open'){
            req_url = "http://101.132.130.125:8000/v1/hwer_dy/";
            // trace_data = JSON.stringify({"pt_dat" : strokes});

            for (var str_idx = 0; str_idx < strokes.length; ++str_idx){
                for (var i = 0; i < strokes[str_idx].length; ++i){
                    pack_traces.push(strokes[str_idx][i][0]);
                    pack_traces.push(strokes[str_idx][i][1]);
                }
                pack_traces.push(-10000);
                pack_traces.push(-10000);
            }
            strokes = pack_traces;
            trace_data = JSON.stringify({"pt_seq" : strokes});
        }
        else if (algo_type == 'det') {
            req_url = "http://192.168.46.123:8989/math_recog/";
            trace_data = JSON.stringify({"pt_dat" : strokes});
        }
        else if (algo_type == 'ssd') {
            req_url = "http://192.168.46.123:8900/math_recog/";
            trace_data = JSON.stringify({"pt_dat" : strokes});
        }
        else if (algo_type == 'seq_open') {
            // req_url = "http://101.132.130.125:8004/upload_task/";
            req_url = "http://101.132.130.125:8000/v1/hwer/";
            // req_url = "http://192.168.46.123:8004/upload_task/";
            for (var str_idx = 0; str_idx < strokes.length; ++str_idx){
                for (var i = 0; i < strokes[str_idx].length; ++i){
                    pack_traces.push(strokes[str_idx][i][0]);
                    pack_traces.push(strokes[str_idx][i][1]);
                }
                pack_traces.push(-10000);
                pack_traces.push(-10000);
            }
            strokes = pack_traces;
            trace_data = JSON.stringify({"pt_seq" : strokes});
        }
        else {
            alert("TIPs: Please check the server type first.");
            return -1;
        }


        // Submit strokes in the required format.
        //strokes = transform(strokes);
        //traces = [];
        //for (var i = 0; i < strokes.length; ++i)
        //    traces.append(strokes[i])
        //post('http://192.168.46.123:8900/send_pts/', {"user" :"hyer", "traces":traces});
        var submit_sync = function () {
            $.ajax({
                type: 'POST',
                url: req_url,
                // url: "http://192.168.46.178:3680/math_recog",
                //contentType: "application/json; charset=utf-8",  //# 不需要！！！
                dataType: "json",  // 这一条表示返回值的类型，不必须，且依据返回值类型而定。
                async: true,
                crossDomain:true,
                // 1 需要使用JSON.stringify 否则格式为 a=2&b=3&now=14...
                // 2 需要强制类型转换，否则格式为 {"a":"2","b":"3"}


                data: trace_data, //JSON.stringify({"pt_seq" : strokes}),

                // beforeSend: function(xhr) {
                //     $latex.empty();
                //     $render.empty();
                // },

                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Server Internal error or check the server status!")
                },

                success: function (jsonResult, textStatus, jqXHR) {
                    if (!jsonResult) {
                        $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                        return false;
                    }
                    if ((algo_type == 'seq_open') || (algo_type == 'det_open')){
                        jsonResult = jsonResult['data'];
                    }
                    // console.log(jsonResult);
                    var latex_str = jsonResult["latex"].toString() + '\n';
                    // alert(jsonResult["result_latex"]);
                    // console.log(data);
                    $render.html('\\[' + latex_str + '\\]');

                    // bbox results
                    boxes = jsonResult["boxes"];
                    var box = [10, 100, 300, 300]; // top left width height
                    sym_ids = new Array(1);
                    box_num = 1;
                    sym1 = $('<div style="width: 100px; height: 200px; border: 2px solid rgba(138, 233, 255, 0.99);"></div>');
                    sym_ids.push(sym1);
                    sym1.appendTo('#draw');
                    sym1.css({
                        "left": "115px",  //boostrap 的container的row缩进15px，所以这里要加上15px， 画布上就是（100px， 100px）
                        "top": "100px",
                        "position": "absolute"
                    });
                    sym1.attr("id", "sym1");
                    $("#sym1").hide();

                    // $latex.html(latex_str);
                    MathJax.Hub.Typeset();
                }
            });
        };
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

    //$('a#clear').on("click", function (e) {
    //    e.preventDefault();
    //    clearStrokes();
    //});
    //
    //$('a#send').on("click", function (e) {
    //    e.preventDefault();
    //    submitStrokes();
    //});

    //$('a#undo').on("click", function (e) {
    //    e.preventDefault();
    //    $canvas.sketchable('undo');
    //});
    //
    //$('a#redo').on("click", function (e) {
    //    e.preventDefault();
    //    $canvas.sketchable('redo');
    //});



    $('#clear').click(function (e) {
        //TODO 删除旧的box 变量
        for (var i = 0; i < 1; ++i) {
            $("#sym1").remove();
        }

        e.preventDefault();
        clearStrokes();
    });

    $('#send').click(function (e) {
        e.preventDefault();
        submitStrokes();
    });

    $('#undo').click(function (e) {
        e.preventDefault();
        $canvas.sketchable('undo');
    });

    $('#redo').click(function (e) {
        e.preventDefault();
        $canvas.sketchable('redo');
    });

    $('#render-gt').click(function (e) {
        e.preventDefault();
        renderGTLatex();
    });

    $('#show-bbox').click(function (e) {
        e.preventDefault();
        showBbox();
    });

    // Render LaTeX math expressions on page load.
    MathJax.Hub.Config({showMathMenu: false});
    MathJax.Hub.Typeset();

});
