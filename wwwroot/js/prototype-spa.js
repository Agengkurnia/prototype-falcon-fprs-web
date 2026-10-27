/* Shared list/detail helpers for the Falcon prototype. Data stays local. */
var PrototypeSpa = {
    asset: function (rel) {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf("/wwwroot/js/layout.js") >= 0) {
                return scripts[i].src.substring(0, scripts[i].src.indexOf("/wwwroot/js/layout.js")) + "/wwwroot/" + rel;
            }
        }
        return "../../../../wwwroot/" + rel;
    },
    emptyHtml: function () {
        return '<div class="text-center py-4"><img src="' + this.asset("img/data_not_found.png") + '" alt="" style="height:220px;max-width:90%;object-fit:contain;" /><div class="text-muted mt-2">no data available in table</div></div>';
    },
    dtLang: function () {
        return {
            search: "",
            lengthMenu: "Show _MENU_",
            info: "Showing _START_ to _END_ of _TOTAL_",
            infoEmpty: "Showing 0",
            zeroRecords: "no data available in table",
            emptyTable: "no data available in table",
            paginate: { previous: "‹", next: "›" }
        };
    },
    /** Standard DataTable options. Sort only on the title header row, not the search row. */
    dtOpts: function (extra) {
        var base = {
            language: this.dtLang(),
            pageLength: 10,
            dom: "lrtip",
            orderCellsTop: true
        };
        return $.extend(true, base, extra || {});
    },
    fmtDate: function (v) {
        if (!v) return "—";
        var d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return String(d.getDate()).padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear();
    },
    confirm: function (text, onYes) {
        if (typeof Swal === "undefined") {
            if (window.confirm(text)) onYes();
            return;
        }
        Swal.fire({
            text: text,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#28c76f"
        }).then(function (r) { if (r.isConfirmed) onYes(); });
    },
    statusBadge: function (active) {
        return active
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Inactive</span>';
    },
    bindColumnSearch: function (table, root) {
        var $root = root ? $(root) : $(document);
        // Sort lives on the title row only — never trigger order from the filter row.
        $root.find("tr.dt-col-search").off("click.dtStd mousedown.dtStd")
            .on("click.dtStd mousedown.dtStd", function (e) { e.stopPropagation(); });
        $root.find("tr.dt-col-search th, tr.dt-col-search input, tr.dt-col-search select, tr.dt-col-search button")
            .off("click.dtStd mousedown.dtStd")
            .on("click.dtStd mousedown.dtStd", function (e) { e.stopPropagation(); });
        $root.find(".btn-col-search").off("click.dtCol").on("click.dtCol", function () {
            var $input = $(this).closest(".input-group").find(".col-search");
            table.column(Number($input.data("col"))).search($input.val() || "").draw();
        });
        $root.find("input.col-search").off("keydown.dtCol").on("keydown.dtCol", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                table.column(Number($(this).data("col"))).search(this.value || "").draw();
            }
        });
        $root.find("select.col-search").off("change.dtCol").on("change.dtCol", function () {
            var val = this.value || "";
            var exact = val === "Active";
            table.column(Number($(this).data("col"))).search(exact ? "^Active$" : val, exact, false).draw();
        });
    },
    setFilteredCard: function (root, filter) {
        $(root).find(".mpg-stat-card").removeClass("is-filtered");
        $(root).find('.mpg-stat-card[data-filter="' + filter + '"]').addClass("is-filtered");
    }
};
