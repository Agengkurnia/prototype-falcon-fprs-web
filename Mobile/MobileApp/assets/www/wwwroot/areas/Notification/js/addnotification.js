var slideon = new Slideon()
slideon.load();

$(".select2").select2();

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
var tblParam;

$(document).ready(function () {
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };
    $.ajax({
        url: urlApiGlobal + '/notification/getmodulnotificationactive',
        type: "POST",
        data: JSON.stringify(dataObject),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var s = '<option disabled selected hidden></option>';
            for (var i = 0; i < response.obj.length; i++) {
                s += '<option value="' + response.obj[i].id + '">' + response.obj[i].title + '</option>';
            }
            $("#frmModul").html(s);
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });


    var jsonString = localStorage.getItem("paramNotification");
    console.log(JSON.parse(jsonString));
    tblParam = $("#tblParam").DataTable({
        "lengthChange": false,
        "ordering": false,
        "searching": false,
        "data": JSON.parse(jsonString),
        "columns": [
            {
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
            },
            { "data": "Title" },
            { "data": "Description" },
            {
                render: function (data, type, row, meta) {
                    console.log(row.IsActive);
                    var html = '<div class="dvAction"><a href="#" data-toggle="modal" data-target="#editparamModal" class="icon-param-edit" data-row="' + meta.row + '" name="editparam"><i class="fa fa-pencil"></i></a>' +
                        '<a href="#" class="icon-param-delete" data-row="' + meta.row + '" name="deleteparam"><i class="fa fa-trash"></i></a>';

                    if (row.IsActive) {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs" checked /></div>';
                    }
                    else {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs" /></div>';
                    }
                    return html;
                }
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new Slideon();
            slideon.load();
        },
    });
})

$(document).on('click', '[name="deleteparam"]', function () {
    let data = $(this).data('row');
    var myData = localStorage.getItem("paramNotification");
    var data_array = JSON.parse(myData);

    data_array.splice(data, 1);
    var myTable = tblParam.clear().rows.add(data_array).draw();

    localStorage.removeItem("paramNotification");

    localStorage.setItem("paramNotification", JSON.stringify(data_array));
    console.log(data_array);
    //alert("Fungsi JavaScript dipanggil! " + data);
    var param = localStorage.getItem("paramNotification");
    if (param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
});

$(document).on('click', '[name="editparam"]', function () {
    let data = $(this).data('row');
    var myData = localStorage.getItem("paramNotification");
    var data_array = JSON.parse(myData);
    $("#idEdit").val(data);
    $("#frmeditParam").val(data_array[data].Title);
    $("#frmeditKet").val(data_array[data].Description);
});

$('#btnEditParam').on('click', function () {
    $('#editparamModal').modal('hide');
    console.log('save');
    var data = $("#idEdit").val();
    var myData = localStorage.getItem("paramNotification");
    var data_array = JSON.parse(myData);

    data_array[data].Title = $("#frmeditParam").val();
    data_array[data].Description = $("#frmeditKet").val();
    console.log(data_array);
    localStorage.setItem("paramNotification", JSON.stringify(data_array));

    let saveData = localStorage.getItem("paramNotification");
    var data = JSON.parse(saveData);
    var myTable = tblParam.clear().rows.add(data).draw();
})

$('#btnSaveParam').on('click', function () {
    $('#paramModal').modal('hide');
    const nama = $("#frmdlParam").val();
    const alamat = $("#frmdlKet").val();

    if (nama && alamat) {
        const newData = {
            Title: nama,
            Description: alamat,
            IsActive: true
        };

        let existingData = localStorage.getItem("paramNotification");
        existingData = existingData ? JSON.parse(existingData) : [];

        existingData.push(newData);
        localStorage.setItem("paramNotification", JSON.stringify(existingData));
        // Reset form fields
        $("#frmdlParam").val("");
        $("#frmdlKet").val("");

        let myData = localStorage.getItem("paramNotification");
        var data = JSON.parse(myData);
        var myTable = tblParam.clear().rows.add(data).draw();

        if ($('#frmTemplate').val() == '' || $('#frmModul').val() == '' || $('#frmNotif').val() == '') {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    } else {
        console.log("Mohon isi semua field");
    }
});

function openParam() {
    $("#btnSaveParam").prop('disabled', true);
}

$('#frmdlParam').on('keyup change', function () {
    if ($('#frmdlKet').val() == '' || $('#frmdlParam').val() == '') {
        $("#btnSaveParam").prop('disabled', true);
    }
    else {
        $("#btnSaveParam").prop('disabled', false);
    }
});

$('#frmdlKet').on('keyup change', function () {
    if ($('#frmdlKet').val() == '' || $('#frmdlParam').val() == '') {
        $("#btnSaveParam").prop('disabled', true);
    }
    else {
        $("#btnSaveParam").prop('disabled', false);
    }
});


$('#frmModul').on('keyup change', function () {
    var param = localStorage.getItem("paramNotification");
    if (this.value == '' || $('#frmTemplate').val() == '' || $('#frmNotif').val() == '' || param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmTemplate').on('keyup change', function () {
    var param = localStorage.getItem("paramNotification");
    if (this.value == '' || $('#frmModul').val() == '' || $('#frmNotif').val() == '' || param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmNotif').on('keyup change', function () {
    var param = localStorage.getItem("paramNotification");
    if (this.value == '' || $('#frmModul').val() == '' || $('#frmTemplate').val() == '' || param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#paramModal').modal('hide');
    saveData();
});

function saveData() {
    var param = localStorage.getItem("paramNotification");
    var data_array = JSON.parse(param);
    var url = "/Master/Notification";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': null,
        'ModuleNotificationId': $('#frmModul').val(),
        'Title': $("#frmTemplate").val(),
        'Content': $("#frmNotif").val(),
        'ParamNotification': data_array
    };
    console.log(JSON.stringify(dataObject));
    $.ajax({
        url: urlApiGlobal + '/notification/createmasternotificationtemplate',
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
                    title: 'Master notification has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                localStorage.removeItem("paramNotification");
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master notification can't been saved",
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
                title: "Master notification can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}