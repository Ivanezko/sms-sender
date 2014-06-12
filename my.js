// Put your custom code here

var uuid = document.location.hash.replace('#','');
var mode = '';
var rallyId = 0;
var isRegistered = false;
$().ready(function(){
    log('приложение запущено');

    var auth_interval = 10000;

    function register() {
        $.getJSON('http://gonki.in.ua/', {act:'getRallyInfo'})
            .done(function(data) {
                $('#title').html(data.name);
                rallyId = data.id;
                isRegistered = true;
                log('register ok:' + rallyId);
            })
            .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ', ' + error;
                log( "Register error: " + err);
            });
    }

    function auth() {
        if (!isRegistered) {
            register();
            return;
        }
        //log( "Auth try with uid: " + uuid);
        $.getJSON('http://gonki.in.ua/rallies/' + rallyId + '/site/mobileinput', {act:'auth',uuid:uuid})
            .done(function(data) {
                $('#gnPname').html(data.n);
                $('#gnInputtext').css('font-size','34px');
                mode = data.m;
                //log( "Auth ok: " + mode);
                if (mode == 'finish') {
                    $('#gnInputtext').attr('placeholder', 'ББ-ЧЧММССмс');
                }
                if (mode == 'start') {
                    $('#gnInputtext').attr('placeholder', 'ББ-ЧЧММ');
                }
                if (mode == 'kv') {
                    $('#gnInputtext').attr('placeholder', 'ББ-ЧЧММ');
                }
                if (mode == 'full') {
                    $('#gnInputtext').attr('placeholder', 'ББ-ЧЧММ-ЧЧММССмс');
                    $('#gnInputtext').css('font-size','30px');
                }
            }).fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ', ' + error;
                log( "Auth error: " + err);
            });
    }

    auth();
    setInterval(auth, auth_interval);

    document.addEventListener("deviceready", function() {
        if (typeof device != 'undefined') uuid = device.uuid;
        log('устройство готово: '+uuid);
        document.addEventListener("online", function() {
            log('есть интернет! :)');
        }, false);

        document.addEventListener("offline", function() {
            log('нет интернета :(');
        }, false);

        document.addEventListener("pause", function() {
            //log('paused!');
        }, false);

        document.addEventListener("resume", function() {
            //log('resume!');
        }, false);

        document.addEventListener("batterycritical", function() {
            log('батарея разряжена');
        }, false);

        document.addEventListener("batterystatus", function(info) {
            log('batterystatus!'+info.level);
            log('batterystatus!'+info.isPlugged);
        }, false);

    }, false);



    //log('device name:'+window.device.name);

    // my events asdsa

    $('#gnSubmit').on('taphold', function(e) {
        var d = $('#gnInputtext').val();

        if (mode == 'finish' && !(/\d{1,3}[^\d]\d{8}/.test(d) || /\d{4}> \d{2}:\d{2}:\d{2},\d{2} .{2}/.test(d)) ) {
            alert('Ошибка ввода!'); return;
        }
        if ((mode == 'start') && !/\d{1,3}[^\d]\d{4}[^\d]?/.test(d)) {
            alert('Ошибка ввода!'+mode); return;
        }
        if ((mode == 'kv') && !/\d{1,3}[^\d]\d{4}/.test(d)) {
            alert('Ошибка ввода!'); return;
        }
        if ((mode == 'full') && !/\d{1,3}[^\d]\d{4}[^\d]?[^\d]\d{8}/.test(d)) {
            alert('Ошибка ввода!'); return;
        }

        var info = {result:d, uuid:uuid};
        $.getJSON('http://gonki.in.ua/rallies/' + rallyId + '/site/mobileinput', info)
            .done(function(data) {
                if (data.result) {
                    log(data.result, 'data');
                    $('#gnInputtext').val('');
                } else {
                    alert(data.error);
                }

            })
            .fail(function(jqxhr, textStatus, error) {
                var err = textStatus + ', ' + error;
                log( "запрос не завершен: " + err);
            });
    });

});

function log(string, type) {
    if (typeof type != undefined)
        $('#log').prepend('<p class="log log-data">'+string+'</p>');
    else
        $('#log').prepend('<p class="log">'+string+'</p>');

    console.log(uuid + ':' + string);
}

function check_network() {
    var networkState = navigator.network.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Неизвестное соединение';
    states[Connection.ETHERNET] = 'кабельное соединение';
    states[Connection.WIFI]     = 'WiFi соединение';
    states[Connection.CELL_2G]  = '2G соединение';
    states[Connection.CELL_3G]  = 'Cell 3G соединение';
    states[Connection.CELL_4G]  = 'Cell 4G соединение';
    states[Connection.NONE]     = 'Нет соединения с интернетом';
    confirm('Вы подключены через:\n ' + states[networkState]);
}