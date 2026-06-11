var slideon = new Slideon();
var isStatus;
var isdisable = true;
var arrayParam;
var toStatus = document.getElementById("cbstatus");
var dataeditor;
var idparameter;
var codeparam;
let ckeditor;

var id;
slideon.load();

autosize(document.getElementsByClassName("autosize"));

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
    let isStarted = true;
    ckeditor = editor;
    editor.enableReadOnlyMode("editor");
    editor.model.document.on('change:data', (evt, data) => {
        if (!isStarted) {
            var param = localStorage.getItem("editParamSKP");
            if (editor.getData() == "" || $('#frmNama').val() == '' || param == null || param == '[]' || $('#frmKategori').val() == '' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '') {
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

    localStorage.removeItem("editParamSKP");

    $(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");

    executeAJAX();
});
/*function GetCoa() {
    return new Promise((resolve, reject) => {
        var dataparam = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId
        };
        $.ajax({
            url: urlApiGlobal + '/promotion/skpmaster/getlistcoacode',
            type: "POST",
            data: JSON.stringify(dataparam),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                var s = '<option disabled selected hidden></option>';
                for (var i = 0; i < response.obj.length; i++) {
                    s += '<option value="' + response.obj[i].coaCode + '">' + response.obj[i].coaCode + '</option>';
                }
                $("#frmCoa").html(s);
                resolve('get Coa');
            },
            failure: function (response) {
                alert(response.d);
                resolve('get Coa');
            },
            error: function (response) {
                alert(response.d);
                resolve('get Coa');
            }
        });
    });
}*/

function GetData() {
    return new Promise((resolve, reject) => {
        var dataparam = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'SkpMasterId': id
        };
        $.ajax({
            url: urlApiGlobal + '/promotion/skpmaster/getskpmasterdetail',
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
                $("#frmCoa").val(data.coaCode);
                $("#frmKategori").val(data.category);
                $("#frmFirst").val(data.firstPartyObligation);
                $("#frmSecond").val(data.secondPartyObligation);
                $("#frmPerjanjian").val(data.agreementContent);
                const html = data.content;
                dataeditor = html;
                ckeditor.setData(dataeditor);

                $("#cbstatus").attr("checked", isStatus);
                getListParam();
            },
            failure: function (response) {
                alert(response.d);
                resolve('get Coa');
            },
            error: function (response) {
                alert(response.d);
                resolve('get Coa');
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
        'SkpMasterId': id,
        'IntPage': 1,
        'IntLength': 1000
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/skpmaster/getlistparamskp',
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
            arrayParam = obj.map(item => ({
                Id: item.id,
                Title: item.title,
                Description: item.description,
                IsActive: item.isActive
            }));

            let existingData = arrayParam;

            localStorage.setItem("editParamSKP", JSON.stringify(existingData));
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
                    let isCheck;
                    if (row.IsActive) {
                        isCheck = 'checked';
                    }
                    else {
                        isCheck = '';
                    }

                    var html = '<div class="dvAction"><button data-toggle="modal" data-target="#editparamModal" class="icon-param-edit btn btn-link isdisabled" data-row="' + meta.row + '" data-id="' + row.Id + '" name="editparam"><i class="fa fa-pencil"></i></button>' +
                        '<button class="icon-param-delete btn btn-link isdisabled" data-toggle="modal" data-target="#deleteModal" data-row="' + meta.row + '" data-id="' + row.Id + '" name="isdelete"><i class="fa fa-trash"></i></button>' +
                        '<input type="checkbox" class="slideon slideon-auto slideon-xs isdisabled datatoogle" id="' + row.Id + '" ' + isCheck + '/></div>';

                    
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

$(document).on('click', '[name="isdelete"]', function () {
    let dataid = $(this).data('row');
    let idparam = $(this).data('id');
    $("#hdnId").val(dataid);
    $("#hdnIdParam").val(idparam);
});

$("#btnDeleteParam").click(function () {
    $('#deleteModal').modal('hide');
    var myData = localStorage.getItem("editParamSKP");
    var data_array = JSON.parse(myData);

    data_array.splice($("#hdnId").val(), 1);
    var myTable = tblParam.clear().rows.add(data_array).draw();

    localStorage.removeItem("editParamSKP");

    localStorage.setItem("editParamSKP", JSON.stringify(data_array));

    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("paramSKP");
    if (param == null || param == '[]' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
    //deleteParamdb();
    //alert("Fungsi JavaScript dipanggil! " + data);
});

$(document).on('click', '[name="editparam"]', function () {
    let data = $(this).data('row');
    let dataid = $(this).data('id');
    var myData = localStorage.getItem("editParamSKP");
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
        'SkpTemplateId': id,
        'Title': $("#frmdlParam").val(),
        'Description': $("#frmdlKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/skpmaster/createparamskp',
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

function deleteParamdb() {
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'ParamSkpId': $("#hdnIdParam").val()
    };
    console.log(formData);
    $.ajax({
        url: urlApiGlobal + '/promotion/skpmaster/deleteparamskp',
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
        'SkpTemplateId': id,
        'Title': $("#frmeditParam").val(),
        'Description': $("#frmeditKet").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/skpmaster/createparamskp',
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
                let saveData = localStorage.getItem("editParamSKP");
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
                /*var formData = {
                    'TxtGUI_trUserLogin': txtGui,
                    'TxtUserID': TxtUserId,
                    'IntCabangID': IntCabangId,
                    'IntCabangPrimaryID': IntCabangId,
                    'ParamSkpId': element.id,
                    'IsActive': element.checked
                };
                $.ajax({
                    url: urlApiGlobal + '/promotion/skpmaster/updateisactiveparamskp',
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
                var myData = localStorage.getItem("editParamSKP");
                var data_array = JSON.parse(myData);

                var dataToUpdate = data_array.find(item => item.Id === element.id);

                if (dataToUpdate) {
                    dataToUpdate.IsActive = element.checked;
                }
                localStorage.setItem("editParamSKP", JSON.stringify(data_array));
                console.log(data_array);
            });
        });
    }
}

$('#btnEditParam').on('click', function () {
    $('#editparamModal').modal('hide');
    $("#btnConfirm").prop('disabled', false);
    var data = $("#idEdit").val();
    var myData = localStorage.getItem("editParamSKP");
    var data_array = JSON.parse(myData);

    data_array[data].Title = $("#frmeditParam").val();
    data_array[data].Description = $("#frmeditKet").val();

    //updateParamdb();

    localStorage.setItem("editParamSKP", JSON.stringify(data_array));
    let saveData = localStorage.getItem("editParamSKP");
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

        let existingData = localStorage.getItem("editParamSKP");
        existingData = existingData ? JSON.parse(existingData) : [];

        existingData.push(newData);
        localStorage.setItem("editParamSKP", JSON.stringify(existingData));
        // Reset form fields
        $("#frmdlParam").val("");
        $("#frmdlKet").val("");

        let myData = localStorage.getItem("editParamSKP");
        var data = JSON.parse(myData);
        var myTable = tblParam.clear().rows.add(data).draw();
        var ckvalue = ckeditor.getData();

        if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
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
    var param = localStorage.getItem("editParamSKP");
    var data_array = JSON.parse(param);
    var html = ckeditor.getData();
    var url = "/Master/SKP";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'IsActive': isStatus,
        'CoaCode': $('#frmCoa').val(),
        'Category': $('#frmKategori').val(),
        'Title': $("#frmNama").val(),
        'FirstPartyObligation': $('#frmFirst').val(),
        'SecondPartyObligation': $('#frmSecond').val(),
        'AgreementContent': $('#frmPerjanjian').val(),
        'Content': html,
        'ParamSkps': data_array
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/skpmaster/createskpmaster',
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
                    title: 'Master SKP has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                localStorage.removeItem("editParamSKP");
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master SKP can't been saved",
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
                title: "Master SKP can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}

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

$('#frmCoa').on('keyup change', function () {
    console.log('opop');
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamSKP");
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        console.log('asas');
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        console.log('hyhy');
    }
});

$('#frmKategori').change(function () {
    console.log('opop');
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamSKP");
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        console.log('asas');
        console.log($('#frmKategori').val());
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        console.log('fdfds');
    }

    if (this.value == '') {
        $("#divContent").hide();
    }
    else {
        $("#divContent").show();
    }
});

$('#frmNama').on('keyup change', function () {
    var param = localStorage.getItem("editParamSKP");
    var ckvalue = ckeditor.getData();
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmFirst').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamSKP");
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmSecond').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamSKP");
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmPerjanjian').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    var param = localStorage.getItem("editParamSKP");
    if ($('#frmNama').val() == '' || $('#frmKategori').val() == '' || param == null || param == '[]' || $('#frmCoa').val() == '' || $('#frmFirst').val() == '' || $('#frmSecond').val() == '' || $('#frmPerjanjian').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});