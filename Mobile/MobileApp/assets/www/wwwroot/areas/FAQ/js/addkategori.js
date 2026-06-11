function saveData() {
    var url = "/Master/FAQ/Kategori";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
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
                    title: 'Master Kategori FAQ has been saved',
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
                    title: "Master Kategori FAQ can't been saved",
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
                title: "Master Kategori FAQ can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}

$('#frmNama').on('keyup change', function () {
    if ($('#frmNama').val() == '' || $('#frmKeterangan').val() == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmKeterangan').on('keyup change', function () {
    if ($('#frmNama').val() == '' || $('#frmKeterangan').val() == '') {
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