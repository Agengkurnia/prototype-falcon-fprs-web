var slideon = new Slideon();
var isStatus;
var isdisable = true;
var arrayParam;
var toStatus = document.getElementById("cbstatus");
var dataeditor;
let ckeditor;

var id;
slideon.load()

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
})

CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
    toolbar: cktoolbar,
    heading: ckheading,
    placeholder: '',
    fontSize: ckfontsize,
    htmlSupport: ckhtmlsupport,
    mention: ckmention,
    removePlugins: ckremoveplugin
}).then(editor => {
    let isReadOnly = true;
    let isStarted = true;
    ckeditor = editor;
    editor.enableReadOnlyMode("editor");
    editor.model.document.on('change:data', (evt, data) => {
        if (!isStarted) {
            var param = localStorage.getItem("editParamKwitansi");
            if (editor.getData() == "" || $('#frmKategori').val() == '' || $('#frmNama').val() == '' || $('#femCoa').val() == '' || param == null || param == '[]') {
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

$(function () {
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    localStorage.removeItem("editParamKwitansi");

    $(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");

    executeAJAX();
});

function GetData() {
    return new Promise((resolve, reject) => {
        var dataparam = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId
        };
        $.ajax({
            url: urlApiGlobal + '/promotion/KwitansiTemplate/GetViewKwitansiTemplate?Id=' + id,
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
                $("#frmKategori").val(data.category);
                const html = data.content;
                //const delta = quill.clipboard.convert(html)
                dataeditor = html;
                ckeditor.setData(dataeditor);
                $("#cbstatus").attr("checked", isStatus);
                //quill.setContents(delta, 'silent');
                getListParam();
                resolve('get Data');
            },
            failure: function (response) {
                alert(response.d);
                resolve('get Data');
            },
            error: function (response) {
                alert(response.d);
                resolve('get Data');
            }
        });
    });
}

function getListParam() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'KwitansiTemplateId': id,
        'IntPage': 1,
        'IntLength': 1000
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/kwitansitemplate/GetListParamKwitansi',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            let obj = response.obj.data;
            console.log(obj);
            arrayParam = obj.map(item => ({
                Id: item.id,
                Title: item.title,
                Description: item.description,
                IsActive: JSON.parse(item.isActive.toLowerCase())
            }));

            let existingData = arrayParam;

            localStorage.setItem("editParamKwitansi", JSON.stringify(existingData));
            getParam();
        }
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
                    console.log(row.IsActive);
                    var html = '<div class="dvAction"><button data-toggle="modal" data-target="#editparamModal" class="icon-param-edit btn btn-link isdisabled" onclick="editParam(' + meta.row + ',\'' + row.Id + '\')"><i class="fa fa-pencil"></i></button>' +
                        '<button class="icon-param-delete btn btn-link isdisabled" data-toggle="modal" data-target="#deleteModal" onclick="isDelete(' + meta.row + ',\'' + row.Id + '\')"><i class="fa fa-trash"></i></button>';

                    if (row.IsActive) {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs isdisabled datatoogle" id="' + row.Id + '" checked /></div>';
                    }
                    else {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs isdisabled datatoogle" id="' + row.Id + '"/></div>';
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
        const result2 = await GetData();
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#divsave").show();
    $("#divedit").hide();
    ckeditor.disableReadOnlyMode("editor");
    isdisable = false;
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();
    ckeditor.enableReadOnlyMode("editor");
    isdisable = true;*/
    window.location.reload();
});

function isDelete(dataid, idparam) {
    $("#hdnId").val(dataid);
    $("#hdnIdParam").val(idparam);
}

$("#btnDeleteParam").click(function () {
    $('#deleteModal').modal('hide');
    var myData = localStorage.getItem("editParamKwitansi");
    var data_array = JSON.parse(myData);

    data_array.splice($("#hdnId").val(), 1);
    var myTable = tblParam.clear().rows.add(data_array).draw();

    localStorage.removeItem("editParamKwitansi");

    localStorage.setItem("editParamKwitansi", JSON.stringify(data_array));

    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamKwitansi");
    if (param == null || param == '[]' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
    //deleteParamdb();
    //alert("Fungsi JavaScript dipanggil! " + data);
});

function editParam(data, dataid) {
    var myData = localStorage.getItem("editParamKwitansi");
    var data_array = JSON.parse(myData);
    $("#btnEditParam").prop('disabled', true);
    $("#idEdit").val(data);
    $("#idParamEdit").val(dataid);
    $("#frmeditParam").val(data_array[data].Title);
    $("#frmeditKet").val(data_array[data].Description);

    valeditparam = data_array[data].Title;
    valeditket = data_array[data].Description;
}

function createParamdb() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': null,
        'KwitansiTemplateId': id,
        'Title': $("#frmdlParam").val(),
        'Description': $("#frmdlKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/CreateParamKwitansi',
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
        'Id': $("#idParamEdit").val(),
        'KwitansiTemplateId': id,
        'Title': $("#frmeditParam").val(),
        'Description': $("#frmeditKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/CreateParamKwitansi',
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
                let saveData = localStorage.getItem("editParamKwitansi");
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
            console.log(response)
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
        url: urlApiGlobal + '/promotion/KwitansiTemplate/DeleteParamKwitansi?Id=' + $("#hdnIdParam").val(),
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

function updateIsActiveParamdb(dataid) {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/UpdateIsActiveParamKwitansi?Id=' + dataid,
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
                console.log(element.id);
                console.log(element.checked);
                /*var formData = {
                    'TxtGUI_trUserLogin': txtGui,
                    'TxtUserID': TxtUserId,
                    'IntCabangID': IntCabangId,
                    'IntCabangPrimaryID': IntCabangId
                };
                console.log(formData);
                $.ajax({
                    url: urlApiGlobal + '/promotion/KwitansiTemplate/UpdateIsActiveParamKwitansi?Id=' + element.id,
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
                });*/
                $("#btnConfirm").prop('disabled', false);
                var myData = localStorage.getItem("editParamKwitansi");
                var data_array = JSON.parse(myData);

                var dataToUpdate = data_array.find(item => item.Id === element.id);

                if (dataToUpdate) {
                    dataToUpdate.IsActive = element.checked;
                }
                localStorage.setItem("editParamKwitansi", JSON.stringify(data_array));
                console.log(data_array);
            });
        });
    }
}


$('#btnEditParam').on('click', function () {
    $('#editparamModal').modal('hide');
    $("#btnConfirm").prop('disabled', false);
    var data = $("#idEdit").val();
    var myData = localStorage.getItem("editParamKwitansi");
    var data_array = JSON.parse(myData);

    data_array[data].Title = $("#frmeditParam").val();
    data_array[data].Description = $("#frmeditKet").val();

    //updateParamdb();

    localStorage.setItem("editParamKwitansi", JSON.stringify(data_array));

    let saveData = localStorage.getItem("editParamKwitansi");
    var data = JSON.parse(saveData);
    var myTable = tblParam.clear().rows.add(data).draw();
});

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

        let existingData = localStorage.getItem("editParamKwitansi");
        existingData = existingData ? JSON.parse(existingData) : [];

        existingData.push(newData);
        localStorage.setItem("editParamKwitansi", JSON.stringify(existingData));
        console.log(localStorage.getItem("editParamKwitansi"));
        // Reset form fields
        $("#frmdlParam").val("");
        $("#frmdlKet").val("");

        let myData = localStorage.getItem("editParamKwitansi");
        var data = JSON.parse(myData);
        var myTable = tblParam.clear().rows.add(data).draw();
        var ckvalue = ckeditor.getData();
        if ($('#frmKategori').val() == '' || $('#frmNama').val() == '' || ckvalue == '') {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    } else {
        console.log("Mohon isi semua field");
    }
});

$('#btnSave').on('click', function () {
    $('#paramModal').modal('hide');
    saveData();
});

function saveData() {
    var param = localStorage.getItem("editParamKwitansi");
    var data_array = JSON.parse(param);
    var html = ckeditor.getData();
    var url = "/Master/Kwitansi";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'IsActive': isStatus,
        'Category': $('#frmKategori').val(),
        'Title': $("#frmNama").val(),
        'Content': html,
        'ParamKwitansi': data_array
    };
    console.log(dataObject);
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/createmasterkwitansitemplate',
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
                    title: 'Master Kwitansi has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                localStorage.removeItem("editParamKwitansi");
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master Kwitansi can't been saved",
                    showConfirmButton: true,
                    text: 'We cannot saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 5000
                })
                //setTimeout(function () { window.location.href = url; }, 4000);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: "Master Kwitansi can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 5000
            })
            //setTimeout(function () { window.location.href = url; }, 4000);
        }
    });
}

$('#frmeditParam').on('keyup change', function () {
    if (this.value == '' || $('#frmeditKet').val() == '' || $('#frmeditParam').val() == valeditparam) {
        $("#btnEditParam").prop('disabled', true);
    }
    else {
        $("#btnEditParam").prop('disabled', false);
    }
});

$('#frmeditKet').on('keyup change', function () {
    if (this.value == '' || $('#frmeditParam').val() == '' || $('#frmeditKet').val() == valeditket) {
        $("#btnEditParam").prop('disabled', true);
    }
    else {
        $("#btnEditParam").prop('disabled', false);
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

$('#frmKategori').change(function () {
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamKwitansi");
    if (this.value == '' || $('#frmNama').val() == '' || param == null || param == '[]' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }

    if (this.value == '') {
        $("#divContent").hide();
    }
    else {
        $("#divContent").show();
    }
});

$('#frmNama').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamKwitansi");
    if (this.value == '' || $('#frmKategori').val() == '' || $('#femCoa').val() == '' || param == null || param == '[]' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});