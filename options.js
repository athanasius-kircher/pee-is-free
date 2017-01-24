var forms = document.querySelectorAll('[data-reference=options-form]');
if(forms.length > 0){
    var optionForm = forms[0];
    chrome.storage.sync.get('options', function(items) {
        if(items && items.options){
            var url = items.options.url;
            var fields = optionForm.querySelectorAll('input');
            fields[0].value = url;
        }
    });
    optionForm.addEventListener('submit',function(event){
        event.preventDefault();
        var fields = optionForm.querySelectorAll('input');
        var url = fields[0].value;
        options = {
            url: url
        }
        if(url != '' && ValidURL(url)){
            chrome.storage.sync.set({
                options: options
            }, function() {
                setStatus('Options saved.',false);
            });
        }else{
            setStatus('No valid url given.',true);
        }

    });
}

function ValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}

function setStatus(msg,error){
    var status = document.getElementById('status');
    status.textContent = msg;
    var standarCssClass = status.className ;
    if(error){
        status.className  = standarCssClass+' error';
    }
    setTimeout(function() {
        status.textContent = '';
        status.className  = standarCssClass
    }, 1500);
}