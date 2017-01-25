var Toilette = function(){
    this.inUse = false;
}

Toilette.prototype.getIcon = function(){
    if(this.inUse){
        return 'icon-use-38.png';
    }else{
        return 'icon-free-38.png';
    }
}

Toilette.prototype.getStatusMessage = function(){
    if(this.inUse){
        return 'Toilette is in use now.';
    }else{
        return 'Toilette is free now.';
    }
}

Toilette.prototype.getInUse = function(){
    return this.inUse;
}

Toilette.prototype.setInUse = function(inUse){
    return this.inUse  = inUse;
}

var ToiletteApp = function(){
    var self = this;
    this.currentToilette = new Toilette();
    this.interval=null;
    this.mode = 'manual';
    this.popupPort = null;
    this.connectError = 0;
    chrome.storage.sync.get('mode', function(items) {
        if(items && items.mode){
            var mode = items.mode;
            self.setMode(mode);
        }
    });
    chrome.extension.onConnect.addListener(function(port) {
        if(port.name=='Popupaction'){
            port.onDisconnect.addListener(function() {
                if(self.popupPort === port){
                    self.popupPort = null;
                }
            });
            self.popupPort = port;
            port.onMessage.addListener(function(command,port) {
                var action = command.action;
                switch(action){
                    case 'get-mode':
                        self.pushMode();
                        break;
                    case 'change-mode':
                        self.setMode(command.val);
                        break;
                    case 'get-state':
                        self.setMode('manual');
                        self.loadState();
                        break;
                }
            });
        }
    })
}

ToiletteApp.prototype.pushMode = function(mode){
    if(this.popupPort){
        this.popupPort.postMessage({action:'set-mode',val:this.mode});
    }
}

ToiletteApp.prototype.setMode = function(mode){
    var self = this;
    if(this.interval){
        window.clearInterval(this.interval);
    }
    this.mode = mode;
    if(this.mode == 'auto'){
        this.interval = window.setInterval(function() {self.loadState();},5000);
    }else{

    }
    chrome.storage.sync.set({
        mode: mode
    }, function() {

    });
    self.pushMode();
}

ToiletteApp.prototype.getAsynchToiletteState = function(cb){
    var self = this;
    chrome.storage.sync.get('options', function(items) {
        if(items && items.options && items.options.url!=''){
            var url = items.options.url;

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    try{
                        var resp = JSON.parse(xhr.responseText);
                        if(resp){
                            self.connectError = 0;
                            cb(resp.toiletIsFree);
                        }else{
                            self.connectError++;
                            if(self.connectError>5){
                                self.connectError = 0;
                                chrome.notifications.create('toilette',{
                                    type: "basic",
                                    iconUrl:'icon-free-38.png',
                                    title:'Toilettestate',
                                    message:"Problem loading data, switch to manual mode."
                                } );
                                self.setMode('manual');
                            }
                        }
                    }catch(e){
                        self.connectError++;
                        if(self.connectError>5){
                            self.connectError = 0;
                            chrome.notifications.create('toilette',{
                                type: "basic",
                                iconUrl:'icon-free-38.png',
                                title:'Toilettestate',
                                message:"Problem loading data, switch to manual mode."
                            } );
                            self.setMode('manual');
                        }
                    }
                }
            }
            xhr.send();
        }
    });
}

ToiletteApp.prototype.loadState = function(){
    var self = this;
    this.getAsynchToiletteState(
        function(currentToiletteUseState){
            if(currentToiletteUseState != self.currentToilette.getInUse()){
                self.currentToilette.setInUse(currentToiletteUseState);
                chrome.browserAction.setIcon({path: self.currentToilette.getIcon()});
                chrome.notifications.create('toilette',{
                    type: "basic",
                    iconUrl:self.currentToilette.getIcon(),
                    title:'Toilettestate',
                    message:self.currentToilette.getStatusMessage()
                } );
            }
        }
    );
}

var app = new ToiletteApp();
