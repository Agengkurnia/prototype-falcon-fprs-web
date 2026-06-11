var startdate = null;
var enddate = null;
var isactive = null;
var kategoriotp = null;
var currentDraw = 0;
var oTable;

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
    oTable = $('#tblKwitansi').DataTable({
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
            url: urlApiGlobal + '/promotion/kwitansitemplate/GetListKwitansiTemplate',
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
                if (json.code == 200) {
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
            { data: "namaTemplate", targets: 0 },
            { data: "kategori", targets: 1 },
            {
                data: "tanggal", targets: 2
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
                    if (row.isActive == "True") {
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
                    return '<a href="../Master/Kwitansi/Detail/' + row.id + '"><i class="fa fa-angle-right"></i></a>';

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
    const checkotp = document.querySelectorAll('input[name="kategoriotp"]');

    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkedOtp = Array.from(checkotp)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    isactive = checkedValues;
    kategoriotp = checkedOtp;

    if (JSON.stringify(checkedValues) == "[]") {
        isactive = null;
    }

    if (JSON.stringify(checkedOtp) == "[]") {
        kategoriotp = null;
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
        'Category': kategoriotp,
        'IsActive': isactive,
        'StartDate': startdate,
        'EndDate': enddate,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObject;
}

$('#searchData').on('keyup change', function () {
    oTable.search(this.value).draw();
});

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

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    //oTable.ajax.reload();
});

$("#btngoAdd").click(function () {
    let url = "/Master/Kwitansi/Add";
    window.location.href = url;
});