var slideon = new Slideon()
slideon.load()

var isStatus;
var id;
var toStatus = document.getElementById("cbstatus");
var dataeditor;
let ckeditor;

CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
    toolbar: cktoolbar,
    heading: ckheading,
    placeholder: '',
    fontSize: ckfontsize,
    htmlSupport: ckhtmlsupport,
    mention: ckmention,
    removePlugins: ckremoveplugin
}).then(editor => {
    let isStarted = true;
    ckeditor = editor;
    editor.enableReadOnlyMode("editor");
    editor.model.document.on('change:data', (evt, data) => {
        if (!isStarted) {
            if (editor.getData() == "" || $('#frmTitle').val() == '' || $('#frmKategori').val() == '') {
                $("#btnConfirm").prop('disabled', true);
            }
            else {
                $("#btnConfirm").prop('disabled', false);
            }
        }

        isStarted = false;
    });
}).catch(error => {
    console.error(error);
});

$(document).ready(function () {
    $(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");

    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'CustomerConsentId': id
    };
    $.ajax({
        url: urlApiGlobal + '/setting/customerconsent/getcustomerconsentdetail',
        type: "POST",
        data: JSON.stringify(dataObject),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var data = response.obj;
            $("#frmTitle").val(data.title);
            $("#frmKategori").val(data.category);

            $("#cbstatus").attr("checked", data.isActive);
            const html = data.content;
            dataeditor = html;
            ckeditor.setData(dataeditor);

            isStatus = data.isActive;
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
})
$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#divsave").show();
    $("#divedit").hide();
    ckeditor.disableReadOnlyMode("editor");
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();
    ckeditor.enableReadOnlyMode("editor");*/
    window.location.reload();
});

function Slideon() {
    this.load = function () {
        var elements = document.querySelectorAll('.slideon.slideon-auto');
        elements.forEach(function (element) {
            element.classList.remove("slideon-auto")
            var wrapper = document.createElement('label')
            wrapper.className = element.classList

            var slider = document.createElement('span')
            slider.className = 'slideon-slider'

            element.after(wrapper)
            wrapper.appendChild(element)
            element.after(slider)
        });
    }
}

toStatus.addEventListener('click', () => {
    $("#btnConfirm").prop('disabled', false);
    isStatus = toStatus.checked;
});

$('#frmTitle').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $('#frmKategori').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmKategori').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $('#frmKategori').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    saveData();
});

function saveData() {
    //console.log(delta.ops);
    /*localStorage.removeItem("saveQuill");

    localStorage.setItem("saveQuill", JSON.stringify(delta));*/
    const html = ckeditor.getData();
    var url = "/Master/CustomerConsent";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Title': $("#frmTitle").val(),
        'Id': id,
        'IsActive': isStatus,
        'Category': $("#frmKategori").val(),
        'Content': html
    };
    $.ajax({
        url: urlApiGlobal + '/setting/customerconsent/createcustomerconsent',
        type: "POST",
        data: JSON.stringify(dataObject),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        success: function (res) {
            var jsonString = JSON.stringify(res);
            if (res.code == 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Master Customer Consent has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master Customer Consent can't been saved",
                    showConfirmButton: true,
                    text: 'We cannot saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: "Master Customer Consent can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}