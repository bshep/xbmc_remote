function isIOS() {
    var IsiPhone = navigator.userAgent.indexOf("iPhone") != -1 ;
    var IsiPod = navigator.userAgent.indexOf("iPod") != -1 ;
    var IsiPad = navigator.userAgent.indexOf("iPad") != -1 ;

    return IsIOS = IsiPhone || IsiPad || IsiPod ;
}

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
    
    baseURL = "http://" + getConfigFromLocalStorage('host') + ":" + getConfigFromLocalStorage('port') + "/xbmcCmds/xbmcHttp";

    data = "command=SetResponseFormat(WebHeader;False;WebFooter;False;header;console.log(\";footer;\");OpenTag; ;closetag; )";
    $.ajax({ url: baseURL, dataType: "jsonp", jsonp: false, cache: false, data: data });
    
    data = {command: "SendKey(" + cmd + ")"};
    $.ajax({ url: baseURL, dataType: "jsonp", jsonp: false, cache: false, data: data });                
    
};


// function logEvent(event) {
//     console.log(event.type);
// }
// 
// window.applicationCache.addEventListener('checking',logEvent,false);
// window.applicationCache.addEventListener('noupdate',logEvent,false);
// window.applicationCache.addEventListener('downloading',logEvent,false);
// window.applicationCache.addEventListener('cached',logEvent,false);
// window.applicationCache.addEventListener('updateready',logEvent,false);
// window.applicationCache.addEventListener('obsolete',logEvent,false);
// window.applicationCache.addEventListener('error',logEvent,false);