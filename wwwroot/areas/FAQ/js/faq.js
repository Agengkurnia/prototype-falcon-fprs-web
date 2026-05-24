var startdate = null;
var enddate = null;
var isactive = null;
var currentDraw = 0;
var oTable;
let isdeleted = $("#faqDelete").val();
$(function () {
    $("#txtStartDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        orientation: "bottom"
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
    GetData();
})

function GetData() {
    oTable = $('#tblFAQ').DataTable({
        "lengthChange": false,
        "ordering": false,
        serverSide: true,
        processing: true,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            loadingRecords: '&nbsp;',
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',
        },
        ajax: {
            url: urlApiGlobal + '/setting/faq/getlistfaqmaster',
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
                //dataTable.clear().draw();
            }
        },
        columnDefs: [
            { defaultContent: '-', targets: '_all' },
            { data: "category", targets: 0 },
            { data: "title", targets: 1 },
            {
                data: "date", targets: 2
                , render: function (data, type) {
                    if (data == null)
                        return null;
                    const originalDate = new Date(data);

                    const day = originalDate.getDate();
                    const month = monthNames[originalDate.getMonth()];
                    const year = originalDate.getFullYear();

                    const formattedDate = `${day} ${month} ${year}`;
                    return formattedDate;
                }
            },
            {
                render: function (data, type, row) {
                    if (row.isActive) {
                        return '<div class="badge badge-active">Active</div>';
                    }
                    else {
                        return '<div class="badge badge-nonactive">Non Active</div>';
                    }
                },

                targets: 3, orderable: false
            },
            {
                render: function (data, type, row) {
                    var html;
                    if (isdeleted == "true") {
                        html = '<button name="btngoDelete" class="icon-param-delete btn btn-link isdisabled" data-toggle="modal" data-target="#deleteModal" data-value="' + row.id + '"><i class="fa fa-trash"></i></button>';
                    }
                    else {
                        html = '';
                    }
                    html += '<a href="../Master/FAQ/Detail/' + row.id + '"><i class="fa fa-angle-right arrowdetail"></i></a>';
                    return html;
                },

                targets: 4, orderable: false
            },
        ]
    });
}

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
        'IsActive': isactive,
        'StartDate': startdate,
        'EndDate': enddate,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObject;
}
$("#btnFilter").click(function () {
    if (($("#txtStartDate").val() != '' && $("#txtEndDate").val() == '')) {
        $("#edmessage").show();
        $('#txtEndDate').addClass('error-input');
    }
    else if (($("#txtEndDate").val() != '' && $("#txtStartDate").val() == '')) {
        $("#sdmessage").show();
        $('#txtStartDate').addClass('error-input');
    }
    else {
        $('#txtStartDate').removeClass('error-input');
        $('#txtEndDate').removeClass('error-input');
        $("#sdmessage").hide();
        $("#edmessage").hide();
        $('#filterModal').modal('hide');
        oTable.ajax.reload();
    }
});

$('#searchData').on('keyup change', function () {
    oTable.search(this.value).draw();
});

$("#btnReset").click(function () {
    //$('#filterModal').modal('hide');
    $("#txtStartDate").val('');
    $("#txtEndDate").val('');

    $("#txtStartDate").datepicker('setEndDate', null);
    $("#txtEndDate").datepicker('setStartDate', null);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Menghapus cek pada setiap checkbox
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    //GetSearchedData();
    //oTable.ajax.reload();
});

$(document).on('click', '[name="btngoDelete"]', function () {
    var id = $(this).data('value');
    $("#hdnIdParam").val(id);
    console.log($("#hdnIdParam").val());
});

$("#btnDeleteParam").click(function () {
    $('#deleteModal').modal('hide');
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'FaqMasterId': $("#hdnIdParam").val()
    };
    console.log(formData);
    $.ajax({
        url: urlApiGlobal + '/setting/faq/deletefaqmaster',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            var data = response.obj;

            Swal.fire({
                icon: 'success',
                title: 'FAQ has been deleted',
                showConfirmButton: false,
                text: 'We have delete your data',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 3000
            })
            setTimeout(function () { oTable.ajax.reload(); }, 2000);
        },
        failure: function (response) {
            Swal.fire({
                icon: 'error',
                title: "FAQ failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        },
        error: function (response) {
            Swal.fire({
                icon: 'error',
                title: "FAQ failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
});

$("#btngoAdd").click(function () {
    let url = "/Master/FAQ/Add";
    window.location.href = url;
});

$("#btngoKategori").click(function () {
    let url = "/Master/FAQ/Kategori";
    window.location.href = url;
});