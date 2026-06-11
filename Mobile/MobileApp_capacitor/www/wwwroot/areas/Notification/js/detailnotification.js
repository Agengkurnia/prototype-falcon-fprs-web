var isdisable = true;
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

var id;
var tblParam;
var arrayParam;
var valeditparam;
var valeditket;
var isStatus;
var idparameter;
var listmodul = [];
var toStatus = document.getElementById("cbstatus");

$(document).ready(function () {
    //$(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];
    executeAJAX();

});

toStatus.addEventListener('click', () => {
    $("#btnConfirm").prop('disabled', false);
    isStatus = toStatus.checked;
})

function getModulNotification() {
    return new Promise((resolve, reject) => {
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
                    listmodul.push(response.obj[i].id);
                }
                $("#frmModul").html(s);
                resolve('Data dari AJAX 1');
            },
            failure: function (response) {
                alert(response.d);
                resolve('Data dari AJAX 1');
            },
            error: function (response) {
                alert(response.d);
                resolve('Data dari AJAX 1');
            }
        });

    });
}

function getData() {
    return new Promise((resolve, reject) => {
        var reqBody = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId
        };
        $.ajax({
            url: urlApiGlobal + '/notification/GetViewNotificationTemplate?Id=' + id,
            type: "POST",
            data: JSON.stringify(reqBody),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                var data = response.obj;
                var dataModul = data.moduleNotification;
                var dataParam = data.paramNotification;
                if (!listmodul.includes(dataModul.id)) {
                    var s = '<option value="' + dataModul.id + '">' + dataModul.title + '</option>';
                    $("#frmModul").append(s).trigger('change');;
                }
                

                let obj = dataParam;
                isStatus = data.isActive;

                arrayParam = obj.map(item => ({
                    Id: item.id,
                    Title: item.title,
                    Description: item.description,
                    IsActive: item.isActive
                }));

                $("#frmModul").val(dataModul.id).trigger("change");
                $("#frmTemplate").val(data.title);
                $("#frmNotif").val(data.content);

                let existingData = arrayParam;
                $("#cbstatus").attr("checked", isStatus);
                localStorage.setItem("paramEditNotification", JSON.stringify(existingData));

                getParam();
            },
            failure: function (response) {
                alert(response.d);
            },
            error: function (response) {
                alert(response.d);
            }
        });
        resolve('Data dari AJAX 2');
    });
}

function getParam() {
    tblParam = $("#tblParam").DataTable({
        "lengthChange": false,
        "pageLength": 10,
        "ordering": false,
        "searching": false,
        "data": arrayParam,
        "language": {
            "paginate": {
                "previous": "<",
                "next": ">"
            }
        },
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
                    var html = '<div class="dvAction"><button data-toggle="modal" data-target="#editparamModal" class="icon-param-edit btn btn-link isdisabled" data-row="' + meta.row + '" data-id="' + row.Id + '" name="editparam"><i class="fa fa-pencil"></i></button>' +
                        '<button class="icon-param-delete btn btn-link isdisabled" data-toggle="modal" data-target="#deleteModal" data-row="' + meta.row + '" data-id="' + row.Id + '" name="isdelete"><i class="fa fa-trash"></i></button>';

                    if (row.IsActive) {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs isdisabled datatoogle" id="' + row.Id + '" checked /></div>';
                    }
                    else {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs isdisabled datatoogle" id="' + row.Id + '" /></div>';
                    }
                    return html;
                }
            },
        ],
        "fnDrawCallback": function () {
            if (isdisable)
                $(".isdisabled").prop("disabled", true);
            else
                $(".isdisabled").prop("disabled", false);
            var slideon = new SlideonParam();
            slideon.load();
        },
    });
}

async function executeAJAX() {
    try {
        const result1 = await getModulNotification();

        const result2 = await getData();

        console.log('Semua permintaan AJAX selesai.');
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#frmTemplate").prop("disabled", true);
    $("#divsave").show();
    $("#divedit").hide();
    isdisable = false;
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();
    isdisable = true;*/
    window.location.reload();
});

$(document).on('click', '[name="editparam"]', function () {
    let dataid = $(this).data('row');
    let idparam = $(this).data('id');
    $("#hdnId").val(dataid);
    $("#hdnIdParam").val(idparam);
});

function deleteParam() {
    $('#deleteModal').modal('hide');
    var myData = localStorage.getItem("paramEditNotification");
    var data_array = JSON.parse(myData);

    const index = data_array.findIndex(item => item.Id === $("#hdnIdParam").val());
    if (index !== -1) {
        data_array.splice(index, 1);
    }
    else {
        data_array.splice($("#hdnId").val(), 1);
    }

    localStorage.removeItem("paramEditNotification");

    localStorage.setItem("paramEditNotification", JSON.stringify(data_array));

    tblParam.clear().rows.add(data_array).draw();

    var param = localStorage.getItem("paramEditNotification");
    $("#frmTemplate").prop("disabled", true);
    if (param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
    //deleteParamdb();
    //alert("Fungsi JavaScript dipanggil! " + data);
}

$(document).on('click', '[name="editparam"]', function () {
    let data = $(this).data('row');
    let dataid = $(this).data('id');
    var myData = localStorage.getItem("paramEditNotification");
    var data_array = JSON.parse(myData);
    idparameter = dataid;
    $("#btnEditParam").prop('disabled', true);
    $("#idEdit").val(data);
    $("#frmeditParam").val(data_array[data].Title);
    $("#frmeditKet").val(data_array[data].Description);

    valeditparam = data_array[data].Title;
    valeditket = data_array[data].Description;
});

function createParamdb() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': null,
        'NotificationTemplateId': id,
        'Title': $("#frmdlParam").val(),
        'Description': $("#frmdlKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/notification/CreateParamNotification',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            console.log(response)
        }
    });
}

function updateParamdb() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': idparameter,
        'NotificationTemplateId': id,
        'Title': $("#frmeditParam").val(),
        'Description': $("#frmeditKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/notification/CreateParamNotification',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            if (response.code == 200) {
                let saveData = localStorage.getItem("paramEditNotification");
                var data = JSON.parse(saveData);
                var myTable = tblParam.clear().rows.add(data).draw();
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Param can't be saved",
                    showConfirmButton: true,
                    text: response.message,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
            }
            console.log(response);
        }
    });
}

function deleteParamdb() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };
    $.ajax({
        url: urlApiGlobal + '/notification/DeleteParamNotification?Id=' + $("#hdnIdParam").val(),
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            console.log(response)
        }
    });
}

function SlideonParam() {
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

            element.addEventListener('click', () => {
                //console.log(element.id);
                //console.log(element.checked);
                /*var formData = {
                    'TxtGUI_trUserLogin': txtGui,
                    'TxtUserID': TxtUserId,
                    'IntCabangID': IntCabangId,
                    'IntCabangPrimaryID': IntCabangId
                };
                console.log(formData);
                $.ajax({
                    url: urlApiGlobal + '/notification/UpdateIsActiveParamNotification?Id=' + element.id,
                    type: 'POST',
                    data: JSON.stringify(formData),
                    dataType: "json",
                    timeout: 15000,
                    contentType: "application/json",
                    headers: {
                        "Authorization": "Bearer " + AccessToken
                    },
                    success: function (response) {
                        $("#btnConfirm").prop('disabled', false);
                        console.log(response)
                    }
                });*/
                $("#btnConfirm").prop('disabled', false);
                var myData = localStorage.getItem("paramEditNotification");
                var data_array = JSON.parse(myData);

                var dataToUpdate = data_array.find(item => item.Id === element.id);

                if (dataToUpdate) {
                    dataToUpdate.IsActive = element.checked;
                }
                localStorage.setItem("paramEditNotification", JSON.stringify(data_array));
            });
        });
    }
}

$('#btnEditParam').on('click', function () {
    $('#editparamModal').modal('hide');
    $("#btnConfirm").prop('disabled', false);
    var data = $("#idEdit").val();
    var myData = localStorage.getItem("paramEditNotification");
    var data_array = JSON.parse(myData);

    data_array[data].Title = $("#frmeditParam").val();
    data_array[data].Description = $("#frmeditKet").val();

    localStorage.setItem("paramEditNotification", JSON.stringify(data_array));
    
    let saveData = localStorage.getItem("paramEditNotification");
    var data = JSON.parse(saveData);
    var myTable = tblParam.clear().rows.add(data).draw();
    $("#frmTemplate").prop("disabled", true);
    //updateParamdb();
})

$('#btnSaveParam').on('click', function () {
    $('#paramModal').modal('hide');
    const nama = $("#frmdlParam").val();
    const alamat = $("#frmdlKet").val();

    $("#btnConfirm").prop('disabled', false);

    if (nama && alamat) {
        //createParamdb();
        const newData = {
            Title: nama,
            Description: alamat,
            IsActive: true
        };

        let existingData = localStorage.getItem("paramEditNotification");
        existingData = existingData ? JSON.parse(existingData) : [];

        existingData.push(newData);
        localStorage.setItem("paramEditNotification", JSON.stringify(existingData));
        // Reset form fields
        $("#frmdlParam").val("");
        $("#frmdlKet").val("");

        let myData = localStorage.getItem("paramEditNotification");
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
    $("#frmTemplate").prop("disabled", true);
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

$('#frmeditParam').on('keyup change', function () {
    if (this.value == '' || $('#frmTemplate').val() == '' || $('#frmNotif').val() == '' || $('#frmeditParam').val() == valeditparam) {
        $("#btnEditParam").prop('disabled', true);
    }
    else {
        $("#btnEditParam").prop('disabled', false);
    }
});

$('#frmeditKet').on('keyup change', function () {
    if (this.value == '' || $('#frmTemplate').val() == '' || $('#frmNotif').val() == '' || $('#frmeditKet').val() == valeditket) {
        $("#btnEditParam").prop('disabled', true);
    }
    else {
        $("#btnEditParam").prop('disabled', false);
    }
});

$('#frmModul').on('keyup change', function () {
    var param = localStorage.getItem("paramEditNotification");
    if (this.value == '' || $('#frmTemplate').val() == '' || $('#frmNotif').val() == '' || param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmTemplate').on('keyup change', function () {
    var param = localStorage.getItem("paramEditNotification");
    if (this.value == '' || $('#frmModul').val() == '' || $('#frmNotif').val() == '' || param == null || param == '[]') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmNotif').on('keyup change', function () {
    var param = localStorage.getItem("paramEditNotification");
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
    var param = localStorage.getItem("paramEditNotification");
    var data_array = JSON.parse(param);
    var url = "/Master/Notification";

    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'ModuleNotificationId': $('#frmModul').val(),
        'Title': $("#frmTemplate").val(),
        'IsActive': isStatus,
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
                localStorage.removeItem("paramEditNotification");
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