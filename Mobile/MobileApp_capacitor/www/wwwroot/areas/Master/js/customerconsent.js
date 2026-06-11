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
    ckeditor = editor;
    editor.model.document.on('change:data', (evt, data) => {
        if (editor.getData() == "" || $('#frmTitle').val() == '' || $('#frmKategori').val() == '') {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    });
}).catch(error => {
    console.error(error);
});

function convertDeltaToHtml() {
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
    convertDeltaToHtml();
});