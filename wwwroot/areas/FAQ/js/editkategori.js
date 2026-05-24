var id;
$(function () {
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    getData();

});
function getData() {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'FaqMasterCategoryId': id
    };
    console.log(id);
    $.ajax({
        url: urlApiGlobal + '/setting/faq/getfaqmastercategorydetail',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var data = response.obj;

            $("#frmNama").val(data.title);
            $("#frmKeterangan").val(data.description);
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
    var url = "/Master/FAQ/Kategori";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'Title': $("#frmNama").val(),
        'Description': $("#frmKeterangan").val()
    };
    $.ajax({
        url: urlApiGlobal + '/setting/faq/createcategoryfaq',
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
                    title: 'Master kategori has been saved',
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
                    title: "Master kategori can't been saved",
                    showConfirmButton: false,
                    text: 'We cannot saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                //setTimeout(function () { window.location.href = url; }, 3000);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: "Master kategori can't been saved",
                showConfirmButton: false,
                text: textStatus,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 4000
            })
            //setTimeout(function () { window.location.href = url; }, 3000);
        }
    });
}

$('#frmNama').on('keyup change', function () {
    if (this.value == '' && $('#frmKeterangan').val() == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmKeterangan').on('keyup change', function () {
    if (this.value == '' && $('#frmNama').val() == '') {
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