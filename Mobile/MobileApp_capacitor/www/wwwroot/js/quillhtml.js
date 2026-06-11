
$(document).ready(function () {
    'use strict';

    var htmlbutton = document.getElementsByClassName("ql-html");
    htmlbutton[0].innerHTML = 'HTML';

    Quill.prototype.getHtml = function () {
        return this.container.querySelector('.ql-editor').innerHTML;
    };

    var quillEd_txtArea_1 = document.createElement('textarea');
    var attrQuillTxtArea = document.createAttribute('quill__html');
    quillEd_txtArea_1.setAttributeNode(attrQuillTxtArea);

    var quillCustomDiv = quill.addContainer('ql-custom');
    quillCustomDiv.appendChild(quillEd_txtArea_1);

    var quillsHtmlBtns = document.querySelectorAll('.ql-html');
    for (var i = 0; i < quillsHtmlBtns.length; i++) {
        quillsHtmlBtns[i].addEventListener('click', function (evt) {
            var wasActiveTxtArea_1 =
                (quillEd_txtArea_1.getAttribute('quill__html').indexOf('-active-') > -1);

            if (wasActiveTxtArea_1) {
                //html editor to quill
                quill.pasteHTML(quillEd_txtArea_1.value);
                evt.target.classList.remove('ql-active');
            } else {
                //quill to html editor
                quillEd_txtArea_1.value = quill.getHtml();
                evt.target.classList.add('ql-active');
            }

            quillEd_txtArea_1.setAttribute('quill__html', wasActiveTxtArea_1 ? '' : '-active-');
        });
    }
});