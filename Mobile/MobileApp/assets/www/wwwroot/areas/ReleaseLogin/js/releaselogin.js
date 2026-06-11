var startdate = null;
var enddate = null;
var isactive = null;
var currentDraw = 0;
var oTable;
var lscheckbox = [];

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
    oTable = $('#tblReleaseLogin').DataTable({
        "lengthChange": false,
        "ordering": false,
        serverSide: true,
        responsive: true,
        processing: true,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',
        },
        ajax: {
            url: urlApiGlobal + '/apigateway/getlistuserlocked',
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

                if (d.search.value != "")
                    dataObjecte.SearchKey = d.search.value;

                dataObjecte.IntPage = output;
                console.log(dataObjecte);
                return JSON.stringify(dataObjecte);
            },
            dataType: "json",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataSrc: function (json) {
                currentDraw = currentDraw + 1;
                if (json.message != "Data Not Found") {

                    json.draw = currentDraw;
                    json.recordsTotal = json.obj.totalData;
                    json.recordsFiltered = json.obj.totalData;
                    return json.obj.data;
                }
                else {
                    json.draw = currentDraw;
                    json.recordsTotal = 0;
                    json.recordsFiltered = 0;
                    let emptydata = null;
                    $("#selectAll").prop("disabled", true);
                    return emptydata;
                }
            },
            error: function (xhr, error, thrown) {
                console.log(error);
            }
        },
        columnDefs: [
            { defaultContent: '-', targets: '_all' },
            {
                render: function (data, type, row, meta) {
                    let isdeleted = '';

                    if (!rlisdelete) {
                        isdeleted = 'disabled'
                    }
                    return `<input type="checkbox" class="checkbox-all" value="${row.id}" ${isdeleted}/>`;
                },

                targets: 0, orderable: false
            },
            { data: "userId", targets: 1 },
            { data: "userName", targets: 2 },
            { data: "deviceName", targets: 3 },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    const originalDate = new Date(row.loginTime);
                    originalDate.setHours(originalDate.getHours() + 7);
                    const day = originalDate.getDate().toString().padStart(2, '0');
                    const month = originalDate.getMonth() + 1;
                    const year = originalDate.getFullYear();
                    const jam = originalDate.getHours();
                    const menit = originalDate.getMinutes().toString().padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day} ${jam}:${menit}`;

                    return formattedDate;
                }
            },
        ],
    });
}

$("#btnRelease").click(function () {
    $('#releaseModal').modal('hide');
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Ids': lscheckbox
    };
    $.ajax({
        url: urlApiGlobal + '/apigateway/releaselogin',
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
                title: 'Account has been release',
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
                title: "Release account failed",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
});

$('#selectAll').change(function () {
    $('.checkbox-all').prop('checked', this.checked);
    if (this.checked) {
        lscheckbox = [];
        $("#btnConfirm").prop('disabled', false);
        $('.checkbox-all:checked').map(function () {
            lscheckbox.push($(this).val());
        }).get();
    }
    else {
        $("#btnConfirm").prop('disabled', true);
        lscheckbox = [];
    }
});

$(document).on('change', '.checkbox-all', function () {
    if ($(this).prop("checked") == true) {
        lscheckbox.push($(this).val());
    }
    else if ($(this).prop("checked") == false) {
        lscheckbox.splice($.inArray(this.value, lscheckbox), 1);
    }

    var atLeastOneChecked = $('.checkbox-all:checked').length > 0;

    if (atLeastOneChecked) {
        $("#btnConfirm").prop('disabled', false);
    } else {
        $("#btnConfirm").prop('disabled', true);
    }
});

$('#searchData').on('keyup change', function () {
    oTable.search(this.value).draw();
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
        'StartDate': startdate,
        'EndDate': enddate,
        'SearchKey': '',
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

$("#btnReset").click(function () {
    //$('#filterModal').modal('hide');
    $("#txtStartDate").val('');
    $("#txtEndDate").val('');

    $("#txtStartDate").datepicker('setEndDate', null);
    $("#txtEndDate").datepicker('setStartDate', null);

    //oTable.ajax.reload();
});