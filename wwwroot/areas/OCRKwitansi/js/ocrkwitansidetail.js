var id;
var title;
var declaration;
var description;
$(function () {
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    localStorage.removeItem("editParamKwitansi");

    $(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");

    GetData();
});

$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#divsave").show();
    $("#divedit").hide();
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();*/
    window.location.reload();
});

function GetData() {
    var dataparam = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'MasterOcrKwitansiId': id
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/getparamocrkwitansidetail',
        type: "POST",
        data: JSON.stringify(dataparam),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var s = '<option disabled selected hidden></option>';
            var data = response.obj;

            isStatus = data.isActive;
            $("#frmNama").val(data.title);
            $("#frmKeterangan").val(data.description);
            $("#frmDeclaration").val(data.declarations);

            title = data.title;
            description = data.description;
            declaration = data.declarations;
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
}

function saveData() {
    var url = "/Master/OCRKuitansi";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'Title': $("#frmNama").val(),
        'Description': $("#frmKeterangan").val(),
        'Declarations': $("#frmDeclaration").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/createparamocrkwitansi',
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
                    title: 'Master OCR Kwitansi has been saved',
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
                    title: "Master OCR Kwitansi can't been saved",
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
                title: "Master OCR Kwitansi can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}

$('#frmNama').on('keyup change', function () {
    if (this.value == '' || $('#frmKeterangan').val() == '' || $('#frmDeclaration').val() == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmKeterangan').on('keyup change', function () {
    if (this.value == '' || $('#frmNama').val() == '' || $('#frmDeclaration').val() == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmDeclaration').on('keyup change', function () {
    if (this.value == '' || $('#frmNama').val() == '' || $('#frmKeterangan').val() == '') {
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