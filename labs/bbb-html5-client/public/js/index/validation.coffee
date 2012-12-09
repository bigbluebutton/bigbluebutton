define ["jquery"], ($) ->

  # Validates form and input for data
  # @param  {[type]} form   [description]
  # @param  {[type]} input1 [description]
  # @param  {[type]} input2 [description]
  # @return {[type]}        [description]
  validateForm = (name, meeting) ->
    if not name? or name.trim() is ""
      alert "Please enter a username"
      false
    else if not meeting? or meeting.trim() is ""
      alert "Please enter a meeting ID"
      false
    else
      true

  $ ->
    $("form#login").on "submit", ->
      validateForm $("#user-name").val(), $("#meeting-id option:selected").val()
