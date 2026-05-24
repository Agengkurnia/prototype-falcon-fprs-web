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
        'IntPage': 1,
        'IntLength': 10
    };
    var retvalData;
    var oTable = $('#tblKategori').DataTable({
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
            url: urlApiGlobal + '/setting/faq/getlistfaqmastercategory',
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
                    return meta.row + 1;
                },

                targets: 0, orderable: false
            },
            { data: "title", targets: 1 },
            { data: "description", targets: 2 },
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
                    var html = '<div class="dvAction"><button class="icon-param-edit btn btn-link" name="btngoEdit" data-value="' + row.id + '" ><i class="fa fa-pencil"></i></button>' +
                        '<button name="btngoDelete" class="icon-param-delete btn btn-link" data-toggle="modal" data-target="#deleteModal"' + isDelete + ' data-value="' + row.id + '"><i class="fa fa-trash"></i></button>';

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
                    'IntCabangPrimaryID': IntCabangId,
                    'FaqMasterCategoryId': element.id,
                    'IsActive': element.checked
                };
                console.log(formData);
                $.ajax({
                    url: urlApiGlobal + '/setting/faq/updateisactivefaqmastercategory',
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

$(document).on('click', '[name="btngoEdit"]', function () {
    var dataValue = $(this).data('value');
    var url = 'EditKategori/' + dataValue;
    window.location.href = url;
});

$(document).on('click', '[name="btngoDelete"]', function () {
    var id = $(this).data('value');
    $("#hdnId").val(id);
    console.log($("#hdnId").val());
});

$("#btnDelete").click(function () {
    var id = $("#hdnId").val();
    deleteData(id);
});

function deleteData(id) {
    $('#deleteModal').modal('hide');
    var url = "/Master/FAQ/Kategori";
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'FaqMasterCategoryId': id
    };
    $.ajax({
        url: urlApiGlobal + '/setting/faq/deletefaqmastercategory',
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
                title: 'Kategori has been deleted',
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
                title: "Kategori failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        },
        error: function (response) {
            Swal.fire({
                icon: 'error',
                title: "Kategori failed to delete!",
                showConfirmButton: true,
                text: response.d,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
};

$("#btngoAddKategori").click(function () {
    let url = "/Master/FAQ/AddKategori";
    window.location.href = url;
});