// $(document).ready(function () {
//   // Initialize DataTable for displaying data
//   $('#example').DataTable({
//     ajax: {
//       url: '/staff',
//       dataSrc: function (data) {
//         // data = JSON.parse(data)
//         return data // Assuming the endpoint returns data in a suitable format
//       },
//     },
//     columns: [
//       {
//         data: null,
//         render: function (data) {
//           return data.first_name + ' ' + data.last_name
//         },
//       },
//       { data: 'position' },
//       { data: 'office' },
//     //   { data: 'extn' },
//       { data: 'start_date' },
//       { data: 'salary' },
//     ],
//     initComplete: function () {
//       // Initialize DataTable Editor for editing
//       var editor = new $.fn.dataTable.Editor({
//         ajax: {
//           create: {
//             type: 'POST',
//             url: '/create_endpoint',
//           },
//           edit: {
//             type: 'PUT',
//             url: '/edit_endpoint',
//           },
//           remove: {
//             type: 'DELETE',
//             url: '/delete_endpoint',
//           },
//         },
//         fields: [
//           { label: 'First name:', name: 'first_name' },
//           { label: 'Last name:', name: 'last_name' },
//           { label: 'Position:', name: 'position' },
//           { label: 'Office:', name: 'office' },
//         //   { label: 'Extension:', name: 'extn' },
//           { label: 'Start date:', name: 'start_date', type: 'datetime' },
//           { label: 'Salary:', name: 'salary' },
//         ],
//         table: '#example',
//       })

//       // Edit record
//       $('#example tbody').on('click', 'td.editor-edit button', function () {
//         var row = $(this).closest('tr')
//         editor.edit(row)
//       })

//       // Delete a record
//       $('#example tbody').on('click', 'td.editor-delete button', function () {
//         var row = $(this).closest('tr')
//         editor.remove(row)
//       })

//       // Add record
//       $('div.dataTables_wrapper div.dataTables_top button').on(
//         'click',
//         function () {
//           editor.create({
//             title: 'Create new record',
//             buttons: 'Add',
//           })
//         }
//       )
//     },
//   })
// })

$(document).ready(function () {
  // Initialize DataTable
  var table = $('#myTable').DataTable({
    ajax: {
      url: '/get_data',
      type: 'GET',
      dataType: 'json',
      dataSrc: function (data) {
        return data // Assuming the endpoint returns data in a suitable format
      },
    },
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'incident_age' },
      { data: 'age' },
      { data: 'city' },
      { data: 'age1' },
      { data: 'incident_age_entered' },
      { data: 'status' }, // New column for status
      {
        data: null,
        render: function (data, type, row) {
          return (
            '<button class="edit-btn" data-id="' +
            data.id +
            '">Edit</button>' +
            '<button class="delete-btn" data-id="' +
            data.id +
            '">Delete</button>'
          )
        },
      },
    ],
  })

  // Event listener for edit button click
  var rowDataToEdit = null // Initialize rowDataToEdit variable

  $('#myTable').on('click', '.edit-btn', function () {
    var row = table.row($(this).closest('tr'))
    if (row && row.data()) {
      var rowData = row.data()
      $('#edit-name').val(rowData.name)
      $('#edit-age').val(rowData.age)
      $('#edit-city').val(rowData.city)
      $('#edit-age1').val(rowData.age1)
      $('#incidentage1').val(rowData.incident_age_entered)
      $('#editModal').modal('show')
      rowDataToEdit = rowData // Store the row data in the global variable
    } else {
      console.error('Row data is undefined')
    }
  })

  $('#save-changes').click(function () {
    var rowData = rowDataToEdit
    if (rowData && rowData.id) {
      var newName = $('#edit-name').val()
      var newAge = parseInt($('#edit-age').val(), 10) // Convert to integer
      var newCity = $('#edit-city').val()
      var newAge1 = parseInt($('#edit-age1').val(), 10) // Convert to integer
      var incident_age_entered = parseInt($('#incidentage1').val(), 10)
      // Compute the difference and determine the status
      var sumOfAges = table
        .rows()
        .data()
        .toArray()
        .filter(function (row) {
          return row.incident_age === incident_age_entered
        })
        .reduce(function (sum, row) {
          return sum + parseInt(row.age, 10)
        }, 0)

      var status = newAge1 - sumOfAges > 0 ? 'Possible' : 'Not Possible'

      var updatedData = {
        name: newName,
        age: newAge,
        city: newCity,
        age1: newAge1,
        incident_age_entered: incident_age_entered,
        status: status, // Include the computed status in the data
      }

      $.ajax({
        url: '/update_data/' + rowData.id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedData),
        success: function (response) {
          console.log(response)
          reloadDataTable() // Reload DataTable to reflect changes
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText)
        },
        complete: function () {
          $('#editModal').modal('hide')
        },
      })
    } else {
      console.error('Row data or its ID is undefined')
    }
  })

  $('#myTable').on('click', '.delete-btn', function () {
    var data = table.row($(this).closest('tr')).data()
    // Send AJAX request to delete data from backend
    $.ajax({
      url: '/delete_data/' + data.id,
      type: 'DELETE',
      success: function (response) {
        console.log(response)
        reloadDataTable()
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText)
      },
    })
  })
})

function reloadDataTable() {
  $.ajax({
    url: '/get_data', // Assuming this endpoint returns updated data
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      $('#myTable').DataTable().clear().rows.add(data).draw() // Update DataTable with new data
    },
    error: function (xhr, status, error) {
      console.error(xhr.responseText)
    },
  })
}
