let index;

var slideon = new Slideon()
slideon.load();

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
            element.after(slider);

            element.addEventListener('click', () => {
                var checkboxes = document.querySelectorAll('.slideon-xs');
                if (element.checked) {
                    var dataObject = {
                        'TxtGUI_trUserLogin': txtGui,
                        'TxtUserID': TxtUserId,
                        'IntCabangID': IntCabangId,
                        'IntCabangPrimaryID': IntCabangId
                    };
                    $.ajax({
                        url: urlApiGlobal + '/setting/customerconsent/UpdateIsActiveModuleNotification?Id=' + element.id,
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

                            }
                            else {

                            }
                        },
                        error: function (xhr, textStatus, errorThrown) {

                        }
                    });
                }
            });
        });
    }
}

$(document).ready(function () {
    var currentDraw = 0;

    var dataObjecte = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'SearchKey': null,
        'IntPage': 1,
        'IntLength': 10
    };
    var retvalData;
    var oTable = $('#tblModul').DataTable({
        "lengthChange": false,
        "ordering": false,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            }
        },
        serverSide: true,
        ajax: {
            url: urlApiGlobal + '/notification/getlistallmodulenotificationtemplate',
            type: "POST",
            data: function (d) {
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
                json.draw = currentDraw;
                json.recordsTotal = json.obj.totalData;
                json.recordsFiltered = json.obj.totalData;
                return json.obj.data;
            },
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
            { data: "namaModul", targets: 1 },
            { data: "keterangan", targets: 2 },
            {
                render: function (data, type, row, meta) {
                    var isActive = '';
                    var isDelete = '';

                    if (!row.isActive) {
                        isActive = 'disabled';
                    }
                    if (!row.isDelete) {
                        isDelete = 'disabled';
                    }
                    var html = '<div class="dvAction"><button data-id="' + row.id + '" name="goedit" class="icon-param-edit btn btn-link"><i class="fa fa-pencil"></i></button>' +
                        '<button class="icon-param-delete btn btn-link" data-toggle="modal" data-target="#deleteModal"' + isDelete + ' data-id="' + row.id + '" name="isdelete" ><i class="fa fa-trash"></i></button>';

                    if (row.isActive) {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs datatoogle" checked id="' + row.id + '" /></div>';
                    }
                    else {
                        html += '<input type="checkbox" class="slideon slideon-auto slideon-xs datatoogle" id="' + row.id + '"/></div>';
                    }
                    return html;
                },
                targets: 3, orderable: false
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new SlideonParam();
            slideon.load();
        },
    });
});

function SlideonParam() {
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

            element.addEventListener('click', () => {
                console.log(element.id);
                console.log(element.checked);
                let statuschecked = !element.checked;
                var formData = {
                    'TxtGUI_trUserLogin': txtGui,
                    'TxtUserID': TxtUserId,
                    'IntCabangID': IntCabangId,
                    'IntCabangPrimaryID': IntCabangId
                };
                console.log(formData);
                $.ajax({
                    url: urlApiGlobal + '/notification/UpdateIsActiveModuleNotification?Id=' + element.id,
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
                            Swal.fire({
                                icon: 'success',
                                title: 'Status change successful!',
                                showConfirmButton: false,
                                text: 'We have saved your data',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                timer: 3000
                            });
                        }
                        else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Status change failed!',
                                showConfirmButton: false,
                                text: response.message,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                timer: 3000
                            });

                            element.checked = statuschecked;
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Status change failed!',
                            showConfirmButton: false,
                            text: errorThrown,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            timer: 3000
                        });

                        element.checked = statuschecked;
                    }
                });
            });
        });
    }
}

$(document).on('click', '[name="goedit"]', function () {
    let data = $(this).data('id');
    var url = 'EditModul/' + data;
    window.location.href = url;
});

$(document).on('click', '[name="isdelete"]', function () {
    let id = $(this).data('id');
    $("#hdnId").val(id);
    console.log($("#hdnId").val());
});

function deleteParam(data) {
    $('#deleteModal').modal('hide');
    var myData = localStorage.getItem("paramEditNotification");
    var data_array = JSON.parse(myData);

    data_array.splice(data, 1);
    var myTable = tblParam.clear().rows.add(data_array).draw();

    localStorage.removeItem("paramEditNotification");

    localStorage.setItem("paramEditNotification", JSON.stringify(data_array));
    console.log(data_array);
    //alert("Fungsi JavaScript dipanggil! " + data);
}

$("#btnDelete").click(function () {
    $('#deleteModal').modal('hide');
    var url = "/Master/Notification/Modul";
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };
    $.ajax({
        url: urlApiGlobal + '/notification/DeleteModuleNotification?Id=' + $("#hdnId").val(),
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var data = response.obj;
            Swal.fire({
                icon: 'success',
                title: 'Modul has been deleted',
                showConfirmButton: false,
                text: 'We have delete your data',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 4000
            })
            setTimeout(function () { window.location.href = url; }, 3000);
        },
        failure: function (response) {
            Swal.fire({
                icon: 'error',
                title: "Modul failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        },
        error: function (response) {
            Swal.fire({
                icon: 'error',
                title: "Modul failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
});

$("#btngoModul").click(function () {
    let url = "/Master/Notification/AddModul";
    window.location.href = url;
});