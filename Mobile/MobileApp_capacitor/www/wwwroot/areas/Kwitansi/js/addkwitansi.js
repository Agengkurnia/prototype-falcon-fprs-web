var slideon = new Slideon();
var tblParam;
var id;
let ckeditor;
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
        var param = localStorage.getItem("paramKwitansi");
        if (editor.getData() == "" || $('#frmKategori').val() == '' || $('#frmNama').val() == '' || $('#femCoa').val() == '' || param == null || param == '[]') {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    });
}).catch(error => {
    console.error(error);
});

$(function () {
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    localStorage.removeItem("editAttachKwitansi");

    $("#divContent").hide();
    $("#divContent").removeAttr("hidden");

    GetParam();
});

function GetParam() {
    var jsonString = localStorage.getItem("paramKwitansi");
    tblParam = $("#tblParam").DataTable({
        "lengthChange": false,
        "ordering": false,
        "searching": false,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            }
        },
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
                    var html = '<div class="dvAction"><a href="#" data-toggle="modal" data-target="#editparamModal" class="icon-param-edit"  data-id="' + meta.row + '" name="editparam"><i class="fa fa-pencil"></i></a>' +
                        '<a href="#" class="icon-param-delete" data-id="' + meta.row + '" name="deleteparam"><i class="fa fa-trash"></i></a>';

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
}

$(document).on('click', '[name="deleteparam"]', function () {
    let data = $(this).data('id');
    var myData = localStorage.getItem("paramKwitansi");
    var data_array = JSON.parse(myData);

    data_array.splice(data, 1);
    var myTable = tblParam.clear().rows.add(data_array).draw();

    localStorage.removeItem("paramKwitansi");

    localStorage.setItem("paramKwitansi", JSON.stringify(data_array));
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("paramKwitansi");
    if (param == null || param == '[]' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    //alert("Fungsi JavaScript dipanggil! " + data);
});

$(document).on('click', '[name="editparam"]', function () {
    let data = $(this).data('id');
    var myData = localStorage.getItem("paramKwitansi");
    var data_array = JSON.parse(myData);
    $("#idEdit").val(data);
    $("#frmeditParam").val(data_array[data].Title);
    $("#frmeditKet").val(data_array[data].Description);
});

$('#btnEditParam').on('click', function () {
    $('#editparamModal').modal('hide');
    var data = $("#idEdit").val();
    var myData = localStorage.getItem("paramKwitansi");
    var data_array = JSON.parse(myData);

    data_array[data].Title = $("#frmeditParam").val();
    data_array[data].Description = $("#frmeditKet").val();
    localStorage.setItem("paramKwitansi", JSON.stringify(data_array));

    let saveData = localStorage.getItem("paramKwitansi");
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

        let existingData = localStorage.getItem("paramKwitansi");
        existingData = existingData ? JSON.parse(existingData) : [];

        existingData.push(newData);
        localStorage.setItem("paramKwitansi", JSON.stringify(existingData));
        // Reset form fields
        $("#frmdlParam").val("");
        $("#frmdlKet").val("");

        let myData = localStorage.getItem("paramKwitansi");
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
    var param = localStorage.getItem("paramKwitansi");
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
    var param = localStorage.getItem("paramKwitansi");
    if (this.value == '' || $('#frmKategori').val() == '' || $('#femCoa').val() == '' || param == null || param == '[]' || ckvalue == '') {
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
    var param = localStorage.getItem("paramKwitansi");
    var data_array = JSON.parse(param);
    var html = ckeditor.getData();
    var url = "/Master/Kwitansi";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': null,
        'IsActive': false,
        'Category': $('#frmKategori').val(),
        'Title': $("#frmNama").val(),
        'Content': html,
        'ParamKwitansi': data_array
    };
    console.log(JSON.stringify(dataObject));
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
                localStorage.removeItem("paramKwitansi");
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master Kwitansi can't been saved",
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
                title: "Master Kwitansi can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}