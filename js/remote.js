function isIOS() {
    var IsiPhone = navigator.userAgent.indexOf("iPhone") != -1 ;
    var IsiPod = navigator.userAgent.indexOf("iPod") != -1 ;
    var IsiPad = navigator.userAgent.indexOf("iPad") != -1 ;

    return IsIOS = IsiPhone || IsiPad || IsiPod ;
}

var db = null;
var config = [];

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
    
    initDB();
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

function initDB(){
    if(db){
        return;
    }
    
    db = window.openDatabase("xbmc_remote", "1","Settings Values", 1048576);
    
    db.transaction(
        function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS config(key TEXT, value TEXT)', []);
        },
        function(err) {
            console.log('initDB: Error: ' + err);
        },
        function() {
            console.log('initDB: Success');
        }
    );
}

function saveDB(){
    var action = 'update';
    
    if(!db){
        initDB();
    }
    
    db.transaction(
        function(tx) {
            for (key in config) {
                console.log('Key: ' + key + ' Value: ' + config[key]);
                tx.executeSql('UPDATE config SET value = ? WHERE key = ?', [ config[key], key ],
                    function(tx,rs) {
                        if(rs.rowsAffected == 0) {
                            tx.executeSql('INSERT INTO config VALUES (?,?)', [ key, config[key] ]);
                            action = 'insert';
                        }
                    });
            }
        },
        function(err) {
            console.log('saveDB: Error: ' + err);
        },
        function() {
            console.log('saveDB: Success (' + action + ')');
        }
    );
}


function initConfig(){
    db.transaction(
        function(tx) {
            tx.executeSql('SELECT key, value FROM config', [], function(tx, rs) {
                for(var i = 0; i < rs.rows.length; i++) {
                    var row = rs.rows.item(i);
                    config[row['key']] = row['value'];
                    // console.log(row['key'] + ' = ' + row['value']);
                }
            });
        },
        function(err) {
            console.log('initConfig: Error: ' + err);
        },
        function() {
            console.log('initConfig: Success');

            checkValidConfig('host', 'localhost');
            checkValidConfig('port', '80');

            saveDB();
            
        }
    );
    
}

function saveConfig(){
    config['host'] = $('#config #host').val();
    config['port'] = $('#config #port').val();

    saveDB();
}

function checkValidConfig(key, defVal) {
    if( config[key] == undefined ) {
        console.log('Set default for \'' + key + '\'');
        config[key] = defVal;
    }
}

function dumpConfig(){
    for(key in config) { 
        console.log('Key: ' + key + ' Value: ' + config[key]);
    }
}

function doCommand(cmd){
    if( cmd == undefined ) {
        return;
    }
    
    if( cmd == "config" ) {
        console.log("Config!");
        
        $('#config #host').val(config['host']);
        $('#config #port').val(config['port']);
        
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
    
    baseURL = "http://" + config['host'] + ":" + config['port'] + "/xbmcCmds/xbmcHttp";

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