window.university = window.university || {};

$.fn.dataTable.ext.errMode = window.university.debugging ? 'alert' : 'none';
$.ajaxSetup({
    complete: function(request) {
        let location = request.getResponseHeader('authorized');
        // if (!location) window.location = '/admin/logout';
    },
});

$(document).ready(() => {
    const $desciplinesTable = $('#descipline-datatable');
    const $universityTable = $('#university-datatable');
    const $agentTable = $('#agent-datatable');
    const $agentUsersTable = $('#agent-users-datatable');
    const $agentUsersUniversitiesTable = $('#agent-users-universities-datatable');
    const $usersTable = $('#users-datatable');
    const $userCreatedTime = $('.userCreatedTime');
    const $winnerReportCreatedTime = $('.winnerReportCreatedTime');
    const $transactionReportCreatedTime = $('.transactionReportCreatedTime');

    const $activationStatus = $('.activationStatus');
    const $levelTable = $('#leval-datatable');
    const $winnerTable = $('#winner-datatable');
    const $winnerGeoTable = $('#winner-geo-datatable');

    const $withdrawTable = $('#withdraw-datatable');
    const $winnerReportTable = $('#winner-report-datatable');
    const $transactionReportTable = $('#transaction-report-datatable');

    const $dashboardWinnerTable = $('#dashboard-winner-datatable');

    $desciplinesTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/admin/descipline-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $universityTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/admin/university-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $agentTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/admin/agent-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $agentUsersTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/agent/users-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $agentUsersUniversitiesTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/agent/universities-list',
            data: { _id: $agentUsersUniversitiesTable.attr("data-id") },
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    const usersTable = $usersTable.DataTable({
        dom: 'Bfltip',
        buttons: [
            {
                extend: 'csv',
                title: $usersTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
                },
            },
            {
                extend: 'excel',
                title: $usersTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
                },
            },
            {
                extend: 'pdf',
                title: $usersTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
                },
            },
            {
                extend: 'print',
                title: $usersTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
                },
                customize: win => {
                    $(win.document.body)
                        .find('h1')
                        .css('text-align', 'center');
                    $(win.document.body)
                        .find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                },
            },
        ],
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1, -4, -5],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/users/list',
            data: data => {
                const createdTimeDateRange = $userCreatedTime
                    .val()
                    .replace(/\s/g, '')
                    .split('to');
                const createdTimeDateRangeStart = createdTimeDateRange[0]
                    ? window.university.utcDateTime(createdTimeDateRange[0]).toISOString()
                    : undefined;
                const createdTimeDateRangeEnd = createdTimeDateRange[1]
                    ? window.university.utcDateTime(utcDateTime(createdTimeDateRange[1]).getTime() + 86399999).toISOString()
                    : undefined;
                const activationStatus = $activationStatus.val() || undefined;
                const typeOfUser = $usersTable.attr('data-type');
                return {
                    ...data,
                    createdTimeDateRangeStart,
                    createdTimeDateRangeEnd,
                    activationStatus,
                    typeOfUser,
                };
            },
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });
    $(document).on('change', '.userCreatedTime,.activationStatus', e => {
        e.preventDefault();
        usersTable.draw();
    });

    const winnerReportTable = $winnerReportTable.DataTable({
        dom: 'Bfltip',
        buttons: [
            {
                extend: 'csv',
                title: $winnerReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'excel',
                title: $winnerReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'pdf',
                title: $winnerReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'print',
                title: $winnerReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
                customize: win => {
                    $(win.document.body)
                        .find('h1')
                        .css('text-align', 'center');
                    $(win.document.body)
                        .find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                },
            },
        ],
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/reports/list',
            data: data => {
                const createdTimeDateRange = $winnerReportCreatedTime
                    .val()
                    .replace(/\s/g, '')
                    .split('to');
                const createdTimeDateRangeStart = createdTimeDateRange[0]
                    ? window.university.utcDateTime(createdTimeDateRange[0]).toISOString()
                    : undefined;
                const createdTimeDateRangeEnd = createdTimeDateRange[1]
                    ? window.university.utcDateTime(utcDateTime(createdTimeDateRange[1]).getTime() + 86399999).toISOString()
                    : undefined;

                return {
                    ...data,
                    createdTimeDateRangeStart,
                    createdTimeDateRangeEnd,
                };
            },
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });
    $(document).on('change', '.winnerReportCreatedTime', e => {
        e.preventDefault();
        winnerReportTable.draw();
    });

    const transactionReportTable = $transactionReportTable.DataTable({
        dom: 'Bfltip',
        buttons: [
            {
                extend: 'csv',
                title: $transactionReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'excel',
                title: $transactionReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'pdf',
                title: $transactionReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
            },
            {
                extend: 'print',
                title: $transactionReportTable.attr('data-caption'),
                exportOptions: {
                    columns: [0, 1, 2, 3],
                },
                customize: win => {
                    $(win.document.body)
                        .find('h1')
                        .css('text-align', 'center');
                    $(win.document.body)
                        .find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                },
            },
        ],
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/reports/transaction-list',
            data: data => {
                const createdTimeDateRange = $transactionReportCreatedTime
                    .val()
                    .replace(/\s/g, '')
                    .split('to');
                const createdTimeDateRangeStart = createdTimeDateRange[0]
                    ? window.university.utcDateTime(createdTimeDateRange[0]).toISOString()
                    : undefined;
                const createdTimeDateRangeEnd = createdTimeDateRange[1]
                    ? window.university.utcDateTime(utcDateTime(createdTimeDateRange[1]).getTime() + 86399999).toISOString()
                    : undefined;

                return {
                    ...data,
                    createdTimeDateRangeStart,
                    createdTimeDateRangeEnd,
                };
            },
        },
        initComplete: (settings, json) => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });
    $(document).on('change', '.transactionReportCreatedTime', e => {
        e.preventDefault();
        transactionReportTable.draw();
    });

    $levelTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/levels/list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $dashboardWinnerTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/auth/dashboard-winner-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $winnerTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/winners/list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $winnerGeoTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/winners/geo-list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });

    $withdrawTable.DataTable({
        aoColumnDefs: [
            {
                bSortable: false,
                aTargets: [-1],
            },
        ],
        stateSave: true,
        searchDelay: 700,
        aaSorting: [[0, 'desc']],
        processing: true,
        serverSide: true,
        ajax: {
            url: '/withdraws/list',
            data: {},
        },
        initComplete: () => {
            $('.tableLoader').css('display', 'none');
        },
        language: {
            paginate: {
                previous: '<i class="mdi mdi-chevron-left">',
                next: '<i class="mdi mdi-chevron-right">',
            },
        },
        drawCallback: () => {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
    });
});
