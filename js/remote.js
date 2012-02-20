function isIOS() {
    var IsiPhone = navigator.userAgent.indexOf("iPhone") != -1 ;
    var IsiPod = navigator.userAgent.indexOf("iPod") != -1 ;
    var IsiPad = navigator.userAgent.indexOf("iPad") != -1 ;

    return IsIOS = IsiPhone || IsiPad || IsiPod ;
}

var XBMCversion = null;

$(document).ready(function() {
    if(!isIOS()) {
        $('.button').live('click', function() {
            doCommand($(this).attr('data'));
        });
    } else {
        $('.button').live('touchend', function() {
            doCommand($(this).attr('data'));
        });
    }
    
    initConfig();
    
    
    checkXBMCversion();
    
    // $('body').bind('orientationchange', function(event) {
    //     rotation = window.orientation;
    //     // alert('rotation = ' + rotation);
    //     $('.button_container').addClass('hidden');
    //     $('#rotation' + rotation).removeClass('hidden');
    // });

    $('body').live('touchmove', function(event) { 
        event.preventDefault(); 
        // alert('opened');
    });

});

function checkXBMCversion(){
    var baseURL = baseURL = "http://" + getConfigFromLocalStorage('host') + ":" + getConfigFromLocalStorage('port') + "/xbmcCmds/xbmcHttp?command=";
    var versionCMD = baseURL + "GetSystemInfoByName(system.buildversion)";
    var formatCMD = baseURL + "SetResponseFormat(WebHeader;false;WebFooter;false;OpenTag;)";
    
    sendByProxy(formatCMD, "", 
        function(data) {
            console.log(data);
        
            sendByProxy(versionCMD, "",
                function(data) {
                    XBMCversion = data.split(" ")[0].split("-");
            
                    console.log("Version: "  + data);

                    $("#xbmcVersion").text(XBMCversion[0]);
                });
        }
    );
    
}

function sendByProxy(url, data, successfn, errorfn){
    proxyURL = "proxy.php";
    proxyData = {  url: url,
                   data: data
                };
    
    $.ajax({ type:"GET", 
             url: proxyURL, 
             dataType: "json", 
             cache: true, 
             data: proxyData, 
             success: function(data) {
                 successfn(data.contents);
             },
             error: function(data) {
                 errorfn(data.contents);
             }
    });
}

function initConfig(){
    getConfigFromLocalStorage('host', 'localhost');
    getConfigFromLocalStorage('port', '80');
}

function saveConfig(){
    localStorage['host'] = $('#config #host').val();
    localStorage['port'] = $('#config #port').val();
}

function getConfigFromLocalStorage(key, defVal) {
    if( localStorage[key] == undefined ) {
        console.log('Set default for \'' + key + '\'');
        localStorage[key] = defVal;
    }
    
    return localStorage[key];
}

function dumpConfig(){
    for(key in localStorage) { 
        console.log('Key: ' + key + ' Value: ' + localStorage[key]);
    }
}

var volume;
function doCommand(cmd){
    if( cmd == undefined ) {
        return;
    }
    
    if( cmd == "config" ) {
        console.log("Config!");
        
        $('#config #host').val(getConfigFromLocalStorage('host'));
        $('#config #port').val(getConfigFromLocalStorage('port'));
        
        $('#config').dialog( { 
            buttons: 
                { 'Cancel': function() { $(this).dialog('close'); },
                    'Save': function() { saveConfig(); $(this).dialog('close'); }
                },
            modal: true,
            resizeable: false
                
        });
        return;
    }
    
    baseURL = "http://" + getConfigFromLocalStorage('host') + ":" + getConfigFromLocalStorage('port') + "/jsonrpc";
    
    // data = {command: "SendKey(" + cmd + ")"};
    if( cmd == "Player.PlayPause" || cmd == "Player.Stop") {
        data = '{"jsonrpc":"2.0", "method":"Player.GetActivePlayers", "id":2}';
        
        sendByProxy(baseURL, data, 
            function(data){
                players = data;
                
                for (var player in players.result) {
                    playerid = players.result[player].playerid;
                    
                    data = '{"jsonrpc":"2.0", "method":"' + cmd + '", "params":{"playerid":' + playerid + '}, "id":2}';
                    // console.log(playerid);
                    sendByProxy(baseURL, data);
                }
            }
        );
    } else if (cmd == "Volume.Up" || cmd == "Volume.Down") {
        data = '{"jsonrpc":"2.0","method":"Application.GetProperties","params":{"properties":["volume"]},"id":2}';
        
        sendByProxy(baseURL, data, 
            function(data){
                volume = data.result.volume;
                
                if (cmd == "Volume.Up") {
                    volume += 1;
                } else {
                    volume -= 1;
                }
                
                data = '{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": { "volume": ' + volume + ' }, "id": 1}';
                
                sendByProxy(baseURL, data);
            }
        );
            
    } else {
        data = '{"jsonrpc":"2.0", "method":"' + cmd + '", "id":2}';
        
        sendByProxy(baseURL, data);
    }
    
};

