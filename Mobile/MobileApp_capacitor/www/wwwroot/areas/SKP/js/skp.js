var startdate = null;
var enddate = null;
var isactive = null;
var category = null;
var coa = null;
var currentDraw = 0;
var oTable;

$(".select2").select2();

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
    executeAJAX();
})

function GetCoa() {
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
                var s = '';
                for (var i = 0; i < response.obj.length; i++) {
                    s += '<option value="' + response.obj[i].coaCode + '">' + response.obj[i].coaCode + '</option>';
                }
                $("#frmKode").html(s);
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
}

function GetData() {
    return new Promise((resolve, reject) => {
        oTable = $('#tblSKP').DataTable({
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
                url: urlApiGlobal + '/promotion/skpmaster/getlistskpmaster',
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
                    console.log('sukses');
                },
                error: function (xhr, error, thrown) {
                    console.log('error');
                    oTable.clear().draw();
                }
            },
            columnDefs: [
                { defaultContent: '-', targets: '_all' },
                { data: "title", targets: 0 },
                { data: "category", targets: 1 },
                { data: "coaCode", targets: 2 },
                {
                    data: "date", targets: 3
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

                    targets: 4, orderable: false
                },
                {
                    render: function (data, type, row) {
                        return '<a href="../Master/SKP/Detail/' + row.id + '"><i class="fa fa-angle-right"></i></a>';

                    },

                    targets: 5, orderable: false
                },
            ],
        });
        resolve('get Data');
    });
}

async function executeAJAX() {
    try {
        const result1 = await GetCoa();

        const result2 = await GetData();

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

$("#btngoAdd").click(function () {
    let url = "/Master/SKP/Add";
    window.location.href = url;
});

$("#btnFilter").click(function () {
    console.log('clickme');
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
})

$('#searchData').on('keyup change', function () {
    oTable.search(this.value).draw();
});

$("#btnReset").click(function () {
    //$('#filterModal').modal('hide');
    $("#txtStartDate").val('');
    $("#txtEndDate").val('');
    $("#frmKode").val([]).change();

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
    startdate = $("#txtStartDate").val();
    enddate = $("#txtEndDate").val();
    coa = $("#frmKode").val();
    const checkboxes = document.querySelectorAll('input[name="isactive"]');
    const cbotp = document.querySelectorAll('input[name="kategoriotp"]');

    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkedOTP = Array.from(cbotp)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    isactive = checkedValues;
    category = checkedOTP;
    console.log($("#frmKode").val());

    if (JSON.stringify(checkedValues) == "[]") {
        isactive = null;
    }

    if (JSON.stringify(checkedOTP) == "[]") {
        category = null;
    }

    if ($("#frmKode").val().length == 0) {
        coa = null;
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
        'Category': category,
        'CoaCode': coa,
        'StartDate': startdate,
        'EndDate': enddate,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObject;
}