var startdate = null;
var enddate = null;
var sdocument = null;
var isactivenews = null;
var firstload = 0;
var tableNotif;
var oTable;

$(function () {
    var activeTab = document.querySelector('.nav-link.active.tabs'); // Sesuaikan dengan kelas yang digunakan oleh kerangka kerja Anda

    // Mendapatkan ID dari tab aktif
    var activeTabId = activeTab.getAttribute('href');

    

    $('#myTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        // menampilkan div lain

        activeTab = document.querySelector('.nav-link.active.tabs');
        activeTabId = activeTab.getAttribute('href');

        if (activeTabId == '#news-1') {
            $('#divnews').show();
            $('#divnotif').hide();
            oTable.columns.adjust().draw();
        }
        else {
            $('#divnews').hide();
            $('#divnotif').show();
        }
    });

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
        $('#filterModalNotif').modal('hide');

        tableNotif.ajax.reload();
    }
});

$("#btnReset").click(function () {
    //$('#filterModalNotif').modal('hide');
    $("#txtStartDate").val('');
    $("#txtEndDate").val('');
    $("#txtStartDate").datepicker('setEndDate', null);
    $("#txtEndDate").datepicker('setStartDate', null);
    //tableNotif.ajax.reload();
});

$("#btnFilterNews").click(function () {
    $('#filterModalNews').modal('hide');

    oTable.ajax.reload();
});

$("#btnResetNews").click(function () {
    //$('#filterModalNews').modal('hide');
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

    if ($("#txtStartDate").val() == '') {
        startdate = null;
    }

    if ($("#txtEndDate").val() == '') {
        enddate = null;
    }

    var dataObjectNotif = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'SearchKey': null,
        'StartDate': startdate,
        'EndDate': enddate,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObjectNotif;
}

function GetSearchedNews() {
    const checkboxes = document.querySelectorAll('input[name="sdocument"]');
    const checkboxact = document.querySelectorAll('input[name="isactive"]');

    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkedValuesStatus = Array.from(checkboxact)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    var booleanArrayOfObjects = checkedValuesStatus.map(function (obj) {
        return obj === "true";
    });

    isactivenews = booleanArrayOfObjects;
    sdocument = checkedValues;

    if (JSON.stringify(booleanArrayOfObjects) == "[]") {
        isactivenews = null;
    }

    if (JSON.stringify(checkedValues) == "[]") {
        sdocument = null
    }

    var dataObjecte = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'SearchKey': null,
        'Status': sdocument,
        'IsActive': isactivenews,
        'IntPage': 1,
        'IntLength': 10
    };
    return dataObjecte;
}

$('#searchData').on('keyup change', function () {
    tableNotif.search(this.value).draw();
});

$('#searchNews').on('keyup change', function () {
    oTable.search(this.value).draw();
});

function Slideon() {
    this.load = function () {
        var elements = document.querySelectorAll('.slideon.slideon-auto');
        elements.forEach(function (element) {
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

$(document).ready(function () {
    var currentDraw = 0;

    oTable = $('#tblNews').DataTable({
        "lengthChange": false,
        "ordering": false,
        bAutoWidth: false,
        processing: true,
        serverSide: true,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',
        },
        ajax: {
            url: urlApiGlobal + '/notification/GetListNews',
            type: "POST",
            data: function (d) {
                var dataObjecte = GetSearchedNews();
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
            { width: "25%", targets: 2 },
            { width: "13%", targets: 1 },
            { width: "5%", targets: 5 },
            { data: "title", targets: 0 },
            {
                data: "date", targets: 1
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
                    const startDate = new Date(row.startDate);
                    const endDate = new Date(row.endDate);

                    const sday = startDate.getDate();
                    const smonth = monthNames[startDate.getMonth()];
                    const syear = startDate.getFullYear();

                    const eday = endDate.getDate();
                    const emonth = monthNames[endDate.getMonth()];
                    const eyear = endDate.getFullYear();

                    const sformattedDate = `${sday} ${smonth} ${syear}`;
                    const eformattedDate = `${eday} ${emonth} ${eyear}`;
                    return sformattedDate + ' - ' + eformattedDate;
                },

                targets: 2, orderable: false
            },
            {
                render: function (data, type, row) {
                    if (row.status == 'Draft') {
                        return '<div class="badge badge-info">Draft</div>'
                    }
                    else {
                        return '<div class="badge badge-primary">Send</div>'
                    }

                },

                targets: 3, orderable: false
            },
            {
                render: function (data, type, row) {
                    if (row.status == 'Draft') {
                        return '-';
                    }
                    else {
                        if (row.isActiveData) {
                            return '<div class="badge badge-active">Active</div>'
                        }
                        else {
                            return '<div class="badge badge-nonactive">Non Active</div>'
                        }
                    }


                },

                targets: 4, orderable: false
            },
            {
                render: function (data, type, row) {
                    if (row.status == 'Draft') {
                        return '<a href="../Master/Notification/EditNews/' + row.id + '"><i class="fa fa-angle-right"></i></a>';
                    }
                    else {
                        return '<a href="../Master/Notification/DetailNews/' + row.id + '"><i class="fa fa-angle-right"></i></a>'
                    }
                },

                targets: 5, orderable: false
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new Slideon();
            slideon.load();
        },
    });

    var currentDrawNotif = 0;


    tableNotif = $('#tblNotification').DataTable({
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
            url: urlApiGlobal + '/notification/getlistallmasternotificationtemplate',
            type: "POST",
            data: function (d) {
                var dataObjectNotif = GetSearchedData();
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
                    dataObjectNotif.SearchKey = null;
                else
                    dataObjectNotif.SearchKey = d.search.value;
                dataObjectNotif.IntPage = output;
                return JSON.stringify(dataObjectNotif)
            },
            dataType: "json",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataSrc: function (json) {
                currentDrawNotif = currentDrawNotif + 1;
                if (json.code == 200) {
                    json.draw = currentDrawNotif;
                    json.recordsTotal = json.obj.totalData;
                    json.recordsFiltered = json.obj.totalData;
                    return json.obj.data;
                }
                else {
                    json.draw = currentDrawNotif;
                    json.recordsTotal = 0;
                    json.recordsFiltered = 0;
                    return json.obj;
                }
            }
        },

        columnDefs: [
            { defaultContent: '-', targets: '_all' },
            { data: "modul", targets: 0 },
            { data: "namaTemplate", targets: 1 },
            { data: "textParam", targets: 2, className: 'text-left' },
            { data: "textNotification", targets: 3, className: 'text-left' },
            {
                data: "tanggal", targets: 4
                , render: function (data, type) {
                    if (data == null)
                        return null;
                    const originalDate = new Date(data);

                    const day = originalDate.getDate();
                    const month = monthNames[originalDate.getMonth()];
                    const year = originalDate.getFullYear();

                    const formattedDate = `${day} ${month} ${year}`;
                    return formattedDate;
                }, className: 'text-left'
            },
            {
                render: function (data, type, row) {
                    if (row.isActive.toUpperCase() == "TRUE") {
                        return '<div class="badge badge-active">Active</div>'
                    }
                    else {
                        return '<div class="badge badge-nonactive">Non Active</div>'
                    }
                },

                targets: 5, orderable: false, className: 'dt-body-left'
            },
            {
                render: function (data, type, row) {
                    return '<a href="../Master/Notification/Detail/' + row.id + '"><i class="fa fa-angle-right"></i></a>'
                },

                targets: 6, orderable: false
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new Slideon();
            slideon.load();
        },
    });

    $('#searchNews').on('keyup change', function () {
        oTable.search(this.value).draw();
    });
});

$("#btngoModulNotification").click(function () {
    let url = "/Master/Notification/Modul";
    window.location.href = url;
});

$("#btngoAddNotification").click(function () {
    let url = "/Master/Notification/Add";
    window.location.href = url;
});

$("#btngoAddNews").click(function () {
    let url = "/Master/Notification/AddNews";
    window.location.href = url;
});