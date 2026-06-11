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
    GetDataPaymentType();
    GetDataStatus();
    GetFilterLOB();
    executeAJAX();
});

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 pada bulan karena indeks dimulai dari 0 dan padStart untuk menambahkan '0' jika perlu
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/* Get Data From Filter */

function GetFilterLOB() {
    let dataLob = storedData.obj.prmObj.objData.UserLOB;
    let halfwayIndex = Math.ceil(dataLob.length / 2);
    let column1Data = dataLob.slice(0, halfwayIndex);
    let column2Data = dataLob.slice(halfwayIndex);

    const column1 = document.getElementById('dvLobColumn1');
    const column2 = document.getElementById('dvLobColumn2');

    let html1 = '';
    let html2 = '';

    column1Data.forEach(item => {
        html1 += `
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" name="cbLob" value="${item.IntLobid}">
                            ${item.TxtLobname}
                        </label>
                    </div>
                `;
    });
    column2Data.forEach(item => {
        html2 += `
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="checkbox" class="form-check-input" name="cbLob" value="${item.IntLobid}">
                            ${item.TxtLobname}
                        </label>
                    </div>
                `;
    });

    column1.innerHTML = html1;
    column2.innerHTML = html2;
}

function GetDataStatus() {
    let dataparam = {
        'txtModuleName': "STATUS_POA",
        'txtQuerry': '',
        'txtDescription': ''
    };

    let param = { 'objRequestData': dataparam };
    $.ajax({
        url: urlApiGlobal + '/POA/GeneratePOALOV_J',
        type: "POST",
        data: JSON.stringify(param),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            GetFilterStatus(response);
        },
        failure: function (response) {
        },
        error: function (response) {
        }
    });
}

function GetFilterStatus(response) {
    let dataStatus = response.objData;
    let halfwayIndex = Math.ceil(dataStatus.length / 2);
    let column1Data = dataStatus.slice(0, halfwayIndex);
    let column2Data = dataStatus.slice(halfwayIndex);

    const column1 = document.getElementById('dvStatusColumn1');
    const column2 = document.getElementById('dvStatusColumn2');

    let html1 = '';
    let html2 = '';

    column1Data.forEach(item => {
        html1 += `
                        <div class="form-check">
                            <label class="form-check-label">
                                <input type="checkbox" class="form-check-input" name="cbStatus" value="${item.txtColumn1}">
                                ${item.txtColumn2}
                                <i class="input-helper"></i>
                            </label>
                        </div>
                    `;
    });
    column2Data.forEach(item => {
        html2 += `
                        <div class="form-check">
                            <label class="form-check-label">
                                <input type="checkbox" class="form-check-input" name="cbStatus" value="${item.txtColumn1}">
                                ${item.txtColumn2}
                                <i class="input-helper"></i>
                            </label>
                        </div>
                    `;
    });

    column1.innerHTML = html1;
    column2.innerHTML = html2;
}

function GetDataPaymentType() {
    let dataparam = {
        'txtModuleName': "PAYMENT_TYPE_POA",
        'txtQuerry': '',
        'txtDescription': ''
    };

    let param = { 'objRequestData': dataparam };
    $.ajax({
        url: urlApiGlobal + '/POA/GeneratePOALOV_J',
        type: "POST",
        data: JSON.stringify(param),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            GetFilterPaymentType(response);
        },
        failure: function (response) {
        },
        error: function (response) {
        }
    });
}

function GetFilterPaymentType(response) {
    let dataStatus = response.objData;
    let halfwayIndex = Math.ceil(dataStatus.length / 2);
    let column1Data = dataStatus.slice(0, halfwayIndex);
    let column2Data = dataStatus.slice(halfwayIndex);

    const column1 = document.getElementById('dvPaymentColumn1');
    const column2 = document.getElementById('dvPaymentColumn2');

    let html1 = '';
    let html2 = '';

    column1Data.forEach(item => {
        html1 += `
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input type="checkbox" class="form-check-input" name="cbPaymentType" value="${item.txtColumn1}">
                                    ${item.txtColumn1}
                                    <i class="input-helper"></i>
                                </label>
                            </div>
                        `;
    });
    column2Data.forEach(item => {
        html2 += `
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input type="checkbox" class="form-check-input" name="cbPaymentType" value="${item.txtColumn1}">
                                    ${item.txtColumn1}
                                    <i class="input-helper"></i>
                                </label>
                            </div>
                        `;
    });

    column1.innerHTML = html1;
    column2.innerHTML = html2;
}

function GetData() {
    function format(id) {
        var html = '<div style="text-align: center;">' +
            '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
            '</div>';

        return html;
    }
    return new Promise((resolve, reject) => {
        oTable = $('#tblPoa').DataTable({
            "lengthChange": false,
            "ordering": false,
            serverSide: true,
            processing: true,
            responsive: true,
            language: {
                "paginate": {
                    "previous": "<",
                    "next": ">"
                },
                processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',

            },
            ajax: {
                url: urlApiGlobal + '/POA/GetListPoA_J',
                type: "POST",
                data: function (d) {
                    $("tbody").attr("style", "filter: opacity(0.5)");
                    $('a[name="godetail"]').on('click', function (e) {
                        e.preventDefault();
                    });

                    $('img[name="infoapprove"]').on('click', function () {
                        return false;
                    });

                    $('.dt-control').removeClass('dt-control');

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
                        dataObjecte.objRequestData.TxtSearch = null;
                    else
                        dataObjecte.objRequestData.TxtSearch = d.search.value;
                    dataObjecte.objRequestData.IntPage = output;
                    return JSON.stringify(dataObjecte);
                },
                dataType: "json",
                contentType: "application/json",
                headers: {
                    "Authorization": "Bearer " + AccessToken
                },
                dataSrc: function (json) {
                    $("tbody").attr("style", "filter: none");
                    currentDraw = currentDraw + 1;
                    if (json.objData == null) {
                        return json.objData;
                    } else {
                        json.draw = currentDraw;
                        json.recordsTotal = json.objData.IntRow;
                        json.recordsFiltered = json.objData.IntRow;
                        return json.objData.Data;
                    }
                },
                error: function (xhr, error, thrown) {
                    console.log('error');
                    oTable.clear().draw();
                }
            },
            "createdRow": function (row, data, dataIndex) {
                // Menambahkan atribut 'id' ke elemen <td> pada kolom pertama
                $('td', row).eq(0).attr('id', data.IntProgramId);
            },
            columnDefs: [
                { width: "100px", targets: 3 },
                { width: "120px", targets: 4 },
                { width: "45px", targets: 8 },
                {
                    defaultContent: '', targets: 0, class: 'dt-control', orderable: false,
                    data: null,
                    render: function (data, type) {
                        return '<i class="fa fa-plus-square-o" style="cursor: pointer;"></i>';
                    }
                },
                { data: "IntProgramId", targets: 1 },
                { data: "TxtProgramName", targets: 2 },
                {
                    render: function (data, type, row) {
                        const startDate = new Date(row.DtStartDate);
                        const endDate = new Date(row.DtEndDate);

                        const sday = startDate.getDate().toString().padStart(2, '0');
                        const smonth = monthNames[startDate.getMonth()];
                        const syear = startDate.getFullYear();

                        const eday = endDate.getDate().toString().padStart(2, '0');
                        const emonth = monthNames[endDate.getMonth()];
                        const eyear = endDate.getFullYear();

                        const sformattedDate = `${sday} ${smonth} ${syear}`;
                        const eformattedDate = `${eday} ${emonth} ${eyear}`;

                        return sformattedDate + ' - ' + eformattedDate;
                    },
                    targets: 3, orderable: false
                },
                { data: "TxtTipeProgramPoaName", targets: 4 },
                { data: "TxtPaymentType", targets: 5 },
                {
                    render: function (data, type, row) {
                        let color = row.objStatusColors;
                        let border = color.TxtBorderColors;
                        let font = color.TxtFontColors;
                        let background = color.TxtBackgroundColors;
                        if (border == null) {
                            border = background;
                        }

                        return '<div class="badge" style="border: 3px solid ' + border + ' ; color:' + font + ' ; background-color:' + background + ';">' + row.TxtStatusName.toLowerCase() + '</div>';
                    },

                    targets: 6, orderable: false
                },
                {
                    render: function (data, type, row) {
                        let txtpayment = row.TxtStatusPayment.toLowerCase();
                        let color = row.objStatusPaymentColors;
                        let border = color.TxtBorderColors;
                        let font = color.TxtFontColors;
                        let background = color.TxtBackgroundColors;
                        let paddingnull = '';
                        if (border == null) {
                            border = background;
                        }
                        if (txtpayment == "") {
                            txtpayment = '-';
                            paddingnull = 'padding-inline: 20px;';
                        }

                        return '<div class="badge" style="border: 3px solid ' + border + ' ; color:' + font + ' ; background-color:' + background + ';' + paddingnull + '">' + txtpayment + '</div>';
                    },

                    targets: 7, orderable: false
                },
                {
                    render: function (data, type, row) {
                        return '<img src="../../assets/images/icons/help-icon.svg" class="img-icon status-approve ic-info" id="' + row.IntProgramId + '" name="infoapprove">' +
                            '<a href="../PlanofActivity/PoA/Detail/' + row.IntProgramId + '" name="godetail"><i class="fa fa-angle-right"></i></a>';

                    },

                    targets: 8, orderable: false
                },
            ],
        });

        oTable.on('click', 'td.dt-control', function (e) {
            let tr = e.target.closest('tr');
            let row = oTable.row(tr);
            let icon = e.target.closest('i');

            var tdId = $(this).attr('id');

            if (row.child.isShown()) {
                icon.classList.remove('fa-minus-square-o');
                icon.classList.add('fa-plus-square-o');
                row.child.hide();
            }
            else {
                if (icon.classList.contains("fa-plus-square-o")) {
                    icon.classList.remove('fa-plus-square-o');
                }
                icon.classList.add('fa-minus-square-o');
                var reqBody = {
                    'TxtGUI_trUserLogin': txtGui,
                    'TxtUserID': TxtUserId,
                    'IntCabangID': IntCabangId,
                    'IntCabangPrimaryID': IntCabangId,
                    'objRequestData': {
                        'TxtGUI_trUserLogin': txtGui,
                        'TxtUserID': TxtUserId,
                        'IntCabangID': IntCabangId,
                        'IntCabangPrimaryID': IntCabangId,
                        'IntProgramId': tdId
                    }
                };

                $.ajax({
                    url: urlApiGlobal + '/prmadapter/syncdata/GetPoaByIdPRM',
                    type: "POST",
                    data: JSON.stringify(reqBody),
                    headers: {
                        "Authorization": "Bearer " + AccessToken
                    },
                    dataType: "json",
                    contentType: "application/json",
                    beforeSend: function () {
                        row.child(format(tdId)).show();
                    },
                    success: function (response) {
                        if (response.code == 200) {
                            let dataoutlet = response.obj.objData.PoAOutlet;
                            let objidentitas;
                            var ihtml = '<table style="width: 100%;">';

                            for (var item of dataoutlet) {
                                let eskp;
                                let payment;
                                let iscomplete;
                                let txtpayment = item.TxtStatusPayment;
                                let color = item.objStatusPaymentColors;
                                let border = color.TxtBorderColors;
                                let font = color.TxtFontColors;
                                let background = color.TxtBackgroundColors;
                                let paddingnull = '';

                                objidentitas = item.objIdentitas;

                                if (item.BitFlagSkp == true) {
                                    eskp = '<div class="badge badge-fcsuccess">E-SKP</div>';
                                }
                                else {
                                    eskp = '<div class="badge badge-fclight">E-SKP</div>';
                                }
                                if (border == null) {
                                    border = background;
                                }

                                if (txtpayment == "" || txtpayment == null) {
                                    txtpayment = '-';
                                    paddingnull = 'padding-inline: 20px;';
                                }
                                else {
                                    txtpayment = txtpayment;
                                }

                                if ((objidentitas.TxtTelpNo && objidentitas.TxtTelpNo.trim()) &&
                                    (objidentitas.TxtJabatanPICName && objidentitas.TxtJabatanPICName.trim()) &&
                                    (objidentitas.TxtPicName && objidentitas.TxtPicName.trim()) &&
                                    (objidentitas.TxtJabatanManagementName && objidentitas.TxtJabatanManagementName.trim()) &&
                                    (objidentitas.TxtManagementName && objidentitas.TxtManagementName.trim()) &&
                                    (objidentitas.TxtTelpNoManagement && objidentitas.TxtTelpNoManagement.trim())) {
                                    iscomplete = '<div class="badge badge-fillsuccess">Data Sudah Lengkap</div>';
                                }
                                else {
                                    iscomplete = '<div class="badge badge-filldanger">Data Belum Lengkap</div>';
                                }

                                payment = '<div class="badge" style="border: 3px solid ' + border + ' ; color:' + font + ' ; background-color:' + background + '; ' + paddingnull + '">' + txtpayment + '</div>';

                                ihtml += '<tr style="background-color: #f2f4f6;">' +
                                    '<td style="width:20%">' +
                                    item.TxtNamaPaidTo +
                                    '</td>' +
                                    '<td style="width:20%">' +
                                    item.TxtPartnerName +
                                    '</td>' +
                                    '<td style="width:23%">' +
                                    eskp +
                                    '<img src="../../assets/images/icons/help-icon.svg" class="img-icon sub-skp ic-info" name="skppaidto" id="' + item.IntProgramId + '|' + item.IntProgramOutletId + '" >' +
                                    '</td>' +
                                    '<td style="width:23%">' +
                                    payment +
                                    '<img src="../../assets/images/icons/help-icon.svg" class="img-icon sub-payment ic-info" name="paymentpaidto" id="' + item.IntProgramId + '|' + item.IntProgramOutletId + '" >' +
                                    '</td>' +
                                    '<td style="width:20%">' +
                                    iscomplete +
                                    '</td>' +
                                    '</tr>';
                            }
                            ihtml += '</table>';
                            row.child(ihtml).show();
                        }
                        else {
                            let errhtml;
                            errhtml = '<div style="text-align: center;">' +
                                '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                                '</div>';
                            row.child(errhtml).show();
                        }
                    },
                    failure: function (response) {
                        alert(response.d);
                    },
                    error: function (response) {
                        alert(response.d);
                    }
                });
                row.child(format(tdId)).show()
            }
        });
        resolve('get Data');
    });
}

async function executeAJAX() {
    try {
        const result2 = await GetData();

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

$(document).on('click', '[name="skppaidto"]', function () {
    $('#skpmodal').modal('show');
    let idEl = $(this)[0].id;
    let idprogram;
    let idprogramoutlet;
    idprogram = idEl.split("|")[0];
    idprogramoutlet = idEl.split("|")[1];
    let divElement = document.getElementById("historySkp");
    let reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': idprogram,
        'PaidToId': idprogramoutlet
    };
    let html;
    $.ajax({
        url: urlApiGlobal + '/promotion/skp/getlisthistoryskp',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            if (response.code == 200) {
                if (response.obj.length > 0) {
                    html = '';
                    for (var item of response.obj) {
                        let stitle;
                        let originalDate;

                        if (item.isUpdate) {
                            originalDate = new Date(item.updateDate);
                            stitle = 'Diupdate';
                        }
                        else {
                            originalDate = new Date(item.createdDate);
                            stitle = 'Dicreate';
                        }

                        const day = originalDate.getDate();
                        const month = monthNames[originalDate.getMonth()];
                        const year = originalDate.getFullYear();
                        const jam = originalDate.getHours();
                        const menit = originalDate.getMinutes().toString().padStart(2, '0');

                        const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                        if (item.TxtDescription == null || item.TxtDescription == '') {
                            description = '';
                        }
                        else {
                            description = '<p><i>' + item.TxtDescription + '</i></p>';
                        }

                        html += `<div class="divhistoryskp">` +
                            `<h4><b>${item.documentNo}</b></h4>` +
                            `<p>${stitle} pada ${formattedDate}</p>` +
                            '</div>';
                    }

                    html += '</ul>'
                    divElement.innerHTML = html;
                }
                else {
                    html = `<div style="text-align: center;">` +
                        `<h4>Tidak ada history</h4>` +
                        '</div>';
                    divElement.innerHTML = html;
                }
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
});

$(document).on('click', '[name="paymentpaidto"]', function () {
    let idprogram;
    let idprogramoutlet;
    let idEl = $(this)[0].id;
    idprogram = idEl.split("|")[0];
    idprogramoutlet = idEl.split("|")[1];
    $('#paymentpaidtoHistory').modal('show');
    var divElement = document.getElementById("historyPaymentPaidto");
    var reqBody = {
        'objRequestData': {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'IntProgramId': idprogram,
            'IntProgramOutletId': idprogramoutlet
        }
    };
    let html;

    $.ajax({
        url: urlApiGlobal + '/POA/GetTimeLinePaidToById_J',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            if (response.bitSuccess) {
                if (response.objData.length > 0) {
                    let count = 0;
                    let description;
                    let icondot;
                    html = '<ul class="timeline">';
                    for (var item of response.objData) {
                        let opacity;
                        const originalDate = new Date(item.DtTimeLine);

                        const day = originalDate.getDate();
                        const month = monthNames[originalDate.getMonth()];
                        const year = originalDate.getFullYear();
                        const jam = originalDate.getHours();
                        const menit = originalDate.getMinutes().toString().padStart(2, '0');

                        if (count > 0) {
                            opacity = ' style="opacity: 50%;"';
                            icondot = 'fa-circle-o';
                        }
                        else {
                            opacity = '';
                            icondot = 'fa-dot-circle-o';
                        }

                        const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                        if (item.TxtDescription == null || item.TxtDescription == '') {
                            description = '';
                        }
                        else {
                            description = '<p><i>' + item.TxtDescription + '</i></p>';
                        }

                        html += `<li>` +
                            `<i class="fa ${icondot}"></i>` +
                            `<div class="timeline-item"  ${opacity}>` +
                            '<h3 class="timeline-header">' +
                            item.TxtStatus +
                            '</h3>' +
                            '<div class="timeline-body">' +
                            item.TxtInfo + ' oleh ' + item.TxtBy + ' pada tanggal ' + formattedDate + ' WIB' +
                            description +
                            '</div>' +
                            '</div>' +
                            '</li>';
                        count++;
                    }

                    html += '</ul>'
                    divElement.innerHTML = html;
                }
                else {
                    html = `<div style="text-align: center;">` +
                        `<h4>Tidak ada history payment</h4>` +
                        '</div>';
                    divElement.innerHTML = html;
                }
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
});

$(document).on('click', '[name="infoapprove"]', function () {
    $('#approveHistory').modal('show');
    let idEl = $(this)[0].id;
    var divElement = document.getElementById("historyApproval");
    var reqBody = {
        'objRequestData': {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'IntProgramId': idEl
        }
    };
    let html;

    $.ajax({
        url: urlApiGlobal + '/POA/GetTimeLinePoaById_J',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            let dttimeline;
            if (response.bitSuccess) {
                let count = 0;
                let icondot = '';
                html = '<ul class="timeline">';
                for (var item of response.objData) {
                    let opacity;
                    let description;
                    const originalDate = new Date(item.DtTimeLine);

                    const day = originalDate.getDate();
                    const month = monthNames[originalDate.getMonth()];
                    const year = originalDate.getFullYear();
                    const jam = originalDate.getHours();
                    const menit = originalDate.getMinutes().toString().padStart(2, '0');

                    const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                    if (item.TxtDescription == null || item.TxtDescription == '') {
                        description = '';
                    }
                    else {
                        description = '<p><i>' + item.TxtDescription + '</i></p>';
                    }

                    if (item.DtTimeLine == null || item.DtTimeLine == '') {
                        dttimeline = item.TxtInfo + ' oleh ' + item.TxtBy;
                        opacity = ' style="opacity: 50%;"';
                    }
                    else {
                        dttimeline = item.TxtInfo + ' oleh ' + item.TxtBy + ' pada tanggal ' + formattedDate + ' WIB';
                        opacity = '';
                    }

                    if (count > 0) {
                        icondot = 'fa-circle-o';
                    }
                    else {
                        icondot = 'fa-dot-circle-o';
                    }
                    html += `<li>` +
                        `<i class="fa ${icondot}"></i>` +
                        `<div class="timeline-item" ${opacity}>` +
                        '<h3 class="timeline-header">' +
                        item.TxtStatus +
                        '</h3>' +
                        '<div class="timeline-body">' +
                        dttimeline +
                        description +
                        '</div>' +
                        '</div>' +
                        '</li>';
                    count++;
                }

                html += '</ul>'
                divElement.innerHTML = html;
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
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

var debouncedAjaxRequest;
$('#searchData').on('keyup change', function () {
    let keyword;
    if (debouncedAjaxRequest) {
        clearTimeout(debouncedAjaxRequest);
    }
    keyword = this.value;
    debouncedAjaxRequest = setTimeout(function () {
        oTable.search(keyword).draw();
    }, 1300);
});

$("#btnReset").click(function () {
    //$('#filterModal').modal('hide');
    $("#txtStartDate").val('');
    $("#txtEndDate").val('');

    $("#txtStartDate").datepicker('setEndDate', null);
    $("#txtEndDate").datepicker('setStartDate', null);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Menghapus cek pada setiap checkbox
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    radioButtons.forEach(function (radioButton) {
        radioButton.checked = false;
    });
    //GetSearchedData();
    //oTable.ajax.reload();
});


function GetSearchedData() {
    let lob;
    let status;
    let payment;
    let memo;
    let startdate = $("#txtStartDate").val();
    let enddate = $("#txtEndDate").val();

    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const sd = new Date(currentYear, currentMonth, 1);
    const nextMonth = currentMonth === 11 ? 0 : (currentMonth + 1)
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const ed = new Date(nextYear, nextMonth, 0);

    if ($("#txtStartDate").val() == '') {
        startdate = formatDate(sd);
    }

    if ($("#txtEndDate").val() == '') {
        enddate = formatDate(ed);
    }


    const cbLob = document.querySelectorAll('input[name="cbLob"]');
    const cbStatus = document.querySelectorAll('input[name="cbStatus"]');
    const cbPaymentType = document.querySelectorAll('input[name="cbPaymentType"]');
    const cbUseMemo = document.getElementsByName("usememo");

    const checkLob = Array.from(cbLob)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkStatus = Array.from(cbStatus)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const checkPayment = Array.from(cbPaymentType)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    for (const rb of cbUseMemo) {
        if (rb.checked) {
            memo = rb.value;
            break;
        }
    }

    lob = checkLob;
    status = checkStatus;
    payment = checkPayment;

    if (JSON.stringify(checkLob) == "[]") {
        lob = null;
    }

    if (JSON.stringify(checkStatus) == "[]") {
        status = null;
    }

    if (JSON.stringify(checkPayment) == "[]") {
        payment = null;
    }

    if (memo == undefined) {
        memo = null;
    }
    else {
        memo = JSON.parse(memo)
    }

    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'IntJabatanId': TxtJabatanId,
        'DtStartDate': startdate,
        'DtEndDate': enddate,
        'FilterStatus': status,
        'FilterTipePembayaran': payment,
        'FilterLOB': lob,
        'FilterMemo': memo,
        'IntPage': 1,
        'IntLength': 10,
        'TxtSearch': '',
        'TxtSortBy': "IntProgramId",
        'BitAscending': false
    };

    var objdata = {
        'objRequestData': dataObject
    };
    return objdata;
}