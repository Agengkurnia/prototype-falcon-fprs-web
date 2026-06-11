var startdate = null;
var enddate = null;
var isactive = null;
var currentDraw = 0;
var oTable;
let isdeleted = $("#ocrDelete").val();
var index;

$(function () {
    GetData();
})

function GetData() {
    oTable = $('#tblOCRKwitansi').DataTable({
        "lengthChange": false,
        "ordering": false,
        serverSide: true,
        processing: true,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',
        },
        ajax: {
            url: urlApiGlobal + '/promotion/KwitansiTemplate/getlistparamocrkwitansi',
            type: "POST",
            data: function (d) {
                var dataObjecte = GetSearchedData();
                var input = d.start;
                var output;
                if (input === 0) {
                    output = 1;
                } else if (input % 10 === 0) {
                    output = input / 10 + 1;
                } else {
                    output = Math.floor(input / 10) + 1;
                }
                index = output - 1;

                if (d.search.value == "")
                    dataObjecte.SearchKey = null;
                else
                    dataObjecte.SearchKey = d.search.value;

                dataObjecte.IntPage = output;
                return JSON.stringify(dataObjecte);
            },
            dataType: "json",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataSrc: function (json) {
                currentDraw = currentDraw + 1;
                if (json.obj != null) {
                    json.draw = currentDraw;
                    json.recordsTotal = json.obj.totalData;
                    json.recordsFiltered = json.obj.totalData;
                    return json.obj.data;
                }
                else {
                    json.draw = currentDraw;
                    json.recordsTotal = 0;
                    json.recordsFiltered = 0;
                    return json.obj;
                }
            },
            error: function (xhr, error, thrown) {
                dataTable.clear().draw();
            }
        },
        columnDefs: [
            { defaultContent: '-', targets: '_all' },
            {
                render: function (data, type, row, meta) {
                    let sum = meta.row + (index * 10);
                    return sum + 1;
                },

                targets: 0, orderable: false
            },
            { data: "title", targets: 1 },
            { data: "description", targets: 2 },
            {
                render: function (data, type, row) {
                    var html;
                    if (isdeleted == "true") {
                        html = '<button class="icon-param-delete btn btn-link isdisabled" data-toggle="modal" data-target="#deleteModal" onclick="isDelete(\'' + row.id + '\')"><i class="fa fa-trash"></i></button>';
                    }
                    else {
                        html = '';
                    }
                    html += '<a href="../Master/OCRKuitansi/Detail/' + row.id + '"><i class="fa fa-angle-right arrowdetail"></i></a>';
                    return html;
                },

                targets: 3, orderable: false
            },
        ],
    });
}

function isDelete(idparam) {
    console.log(idparam);
    $("#hdnIdParam").val(idparam);
}

function deleteParam() {
    $('#deleteModal').modal('hide');
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'MasterOcrKwitansiId': $("#hdnIdParam").val()
    };
    console.log(formData);
    $.ajax({
        url: urlApiGlobal + '/promotion/KwitansiTemplate/deleteparamocrkwitansi',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'OCR Kwitansi has been deleted',
                showConfirmButton: false,
                text: 'We have delete your data',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 2000
            })
            setTimeout(function () { oTable.ajax.reload(); }, 2000);
        },
        error: function (response) {
            Swal.fire({
                icon: 'error',
                title: "OCR Kwitansi failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}

$('#searchData').on('keyup change', function () {
    oTable.search(this.value).draw();
});

$("#btngoAdd").click(function () {
    let url = "/Master/OCRKuitansi/Add";
    window.location.href = url;
});

function GetSearchedData() {
    startdate = $("#txtStartDate").val();
    enddate = $("#txtEndDate").val();
    const checkboxes = document.querySelectorAll('input[name="isactive"]');

    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    isactive = checkedValues;

    if (JSON.stringify(checkedValues) == "[]") {
        isactive = null;
    }

    if ($("#txtStartDate").val() == '') {
        startdate = null;
    }

    if ($("#txtEndDate").val() == '') {
        enddate = null;
    }

    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'SearchKey': null,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObject;
}