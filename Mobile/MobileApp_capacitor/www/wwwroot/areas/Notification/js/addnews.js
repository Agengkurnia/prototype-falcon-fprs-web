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
        if (editor.getData() == "" || $('#txtStartDate').val() == '' || $("#txtEndDate").val() == '' || $('#frmTitle').val() == '') {
            $("#btnConfirm").prop('disabled', true);
            $("#btnDraft").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
            $("#btnDraft").prop('disabled', false);
        }
    });
}).catch(error => {
    console.error(error);
});

$(function () {
    $("#txtStartDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        orientation: "bottom",
        startDate: new Date(),
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $("#txtEndDate").datepicker('setStartDate', minDate);
    });
    $("#txtEndDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        orientation: "bottom",
        minDate: $("#txtStartDate").datepicker("getDate")
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $("#txtStartDate").datepicker('setEndDate', minDate);
    });
});

function convertDeltaToHtml(status) {
    //console.log(delta.ops);
    /*localStorage.removeItem("saveQuill");

    localStorage.setItem("saveQuill", JSON.stringify(delta));*/
    var isactive;
    if (status == 'Draft') {
        isactive = false;
    }
    else {
        isactive = true;
    }
    const html = ckeditor.getData();
    var url = "/Master/Notification";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Title': $("#frmTitle").val(),
        'StartDate': $("#txtStartDate").val(),
        'EndDate': $("#txtEndDate").val(),
        'Content': html,
        'Status': status,
        'IsActive': isactive //Jika status Send, maka true
    };
    $.ajax({
        url: urlApiGlobal + '/notification/CreateNews',
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
                    title: 'Master News has been saved',
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
                    title: "Master News can't been saved",
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
                title: "Master News can't been saved",
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
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#txtStartDate').on('change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#txtEndDate').on('change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    convertDeltaToHtml('Send');
});

$('#btnSaveDraft').on('click', function () {
    $('#draftModal').modal('hide');
    convertDeltaToHtml('Draft');
});