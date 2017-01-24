var clickElements = document.querySelectorAll('[data-click-action]');
var port = chrome.extension.connect({
    name: "Popupaction"
});
port.onMessage.addListener(function(command) {
    if(command.action == 'set-mode'){
        var mode = command.val;
        var manEle = document.getElementById('mode-manual');
        var autoEle = document.getElementById('mode-auto');
        if(mode == 'auto'){
            manEle.checked = false;
            autoEle.checked = true;
        }else{
            manEle.checked = true;
            autoEle.checked = false;
        }
    }
});
port.postMessage({action:'get-mode'});

for(var i=0,len=clickElements.length;i<len;i++){
    clickElements[i].addEventListener('click',function(event){
        event.preventDefault();
        var ele = this;
        var action = ele.dataset.clickAction;
        switch(action){
            case 'change-mode':
                var val = ele.value;
                port.postMessage({action:action,val:val});
                break;
            case 'get-state':
                port.postMessage({action:action});
                break;
        }
    })
}