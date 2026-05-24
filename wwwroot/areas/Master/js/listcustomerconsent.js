var slideon = new Slideon();
slideon.load();
var oTable;
var category = null;
var statusActive = null;
var startdate = null;
var enddate = null;

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

    // Menghapus cek pada setiap checkbox
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    //GetSearchedData();
    //oTable.ajax.reload();
});

function GetSearchedData() {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    const checkboxact = document.querySelectorAll('input[name="status"]');

    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkedValuesStatus = Array.from(checkboxact)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    var booleanArrayOfObjects = checkedValuesStatus.map(function (obj) {
        return obj === "true";
    });

    statusActive = booleanArrayOfObjects;
    category = checkedValues;

    startdate = $("#txtStartDate").val();
    enddate = $("#txtEndDate").val();

    if (JSON.stringify(booleanArrayOfObjects) == "[]") {
        statusActive = null;
    }

    if (JSON.stringify(checkedValues) == "[]") {
        category = null
    }

    if ($("#txtStartDate").val() == '') {
        startdate = null;
    }

    if ($("#txtEndDate").val() == '') {
        enddate = null;
    }

    var dataObjecte = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'SearchKey': null,
        'IsActive': statusActive,
        'Category': category,
        'StartDate': startdate,
        'EndDate': enddate,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObjecte;
}

$(document).ready(function () {
    var currentDraw = 0;
    var retvalData;
    oTable = $('#tblConsumer').DataTable({
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
            url: urlApiGlobal + '/setting/customerconsent/getlistcustomerconsent',
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
                dataObjecte.SearchKey = d.search.value;
                dataObjecte.IntPage = output;
                return JSON.stringify(dataObjecte)
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
                else{
                    json.draw = currentDraw;
                    json.recordsTotal = 0;
                    json.recordsFiltered = 0;
                    return json.obj;
                }
            },
        },
        columnDefs: [
            { defaultContent: '-', targets: '_all' },
            { data: "title", targets: 0 },
            { data: "category", targets: 1 },
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
                    if (row.isActive == true) {
                        return '<div class="badge badge-active">Active</div>'
                    }
                    else {
                        return '<div class="badge badge-nonactive">Non Active</div>'
                    }
                },

                targets: 3, orderable: false
            },
            {
                render: function (data, type, row) {
                    return '<a href="../Master/CustomerConsent/Detail/' + row.id +  '"><i class="fa fa-angle-right"></i></a>'
                },

                targets: 4, orderable: false
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new Slideon();
            slideon.load();
        },
    });

    $('#searchData').on('keyup change', function () {
        oTable.search(this.value).draw();
    });
});

$("#btngoAdd").click(function () {
    let url = "/Master/CustomerConsent/Add";
    window.location.href = url;
});