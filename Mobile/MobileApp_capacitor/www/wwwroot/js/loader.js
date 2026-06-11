function trimString(input) {
    const parts = input.split('/');

    if (parts.length >= 3) {
        parts.splice(3);
    }

    return parts.join('/');
}
$(document).ready(function () {
    var path = window.location.pathname;
    var trm = trimString(path);
    $('.nav-link').each(function () {
        var href = $(this).attr('href');
        if (trm === href) {
            $(this).addClass('active');
            $(this).closest('.nav-item').addClass('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var bodyElement = document.body;

    bodyElement.classList.add('loaded');
});

$("#btnLogout").click(function () {
    Logout();
});