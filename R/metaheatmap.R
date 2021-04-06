matrix_to_js_array <- function(R){
  output_str <- "["
  for(i in 1:nrow(R)){
    if(i == nrow(R)){
      output_str <- paste0(output_str, "[", paste(R[i,], collapse = ","), "]")
    }else{
      output_str <- paste0(output_str, "[", paste(R[i,], collapse = ","), "],")
    }
  }
  output_str <- paste0(output_str, "]")
  return(output_str)
}

get_script <- function(script_file_name){
  fileName <- system.file("scripts", script_file_name, package = "metaheatmap")
  readChar(fileName, file.info(fileName)$size)
}

metaheatmap <- function(R,
                        col_ann,
                        row_ann,
                        annotation_colors,
                        file_path,
                        file_name = "output.html",
                        block_width = 5,
                        grid_line_width = 1) {

  fileConn<-file(paste0(file_path, file_name))

  padding <- 5
  gmd_width <- block_width*3*ncol(row_ann) + padding
  gmd_height <- block_width*nrow(R) + padding
  cmd_width <- block_width*ncol(R) + padding
  cmd_height <- block_width*3*ncol(col_ann) + padding

  heatmap_width <- block_width*ncol(R)+padding
  heatmap_height <- block_width*nrow(R)+padding

  infobox_html <-
    paste0(
      "<span id = 'gene_name'></span></br>",
      paste0(colnames(row_ann),
             ": <div class ='legend_block' id = 'gene_legend_",
             colnames(row_ann),
             "'></div> <span id = 'gene_",
             colnames(row_ann), "'>
             </span></br>", collapse = ""),
      "<hr>",
      "<span id = 'cell_name'></span></br>",
      paste0(colnames(col_ann),
             ": <div class ='legend_block' id = 'cell_legend_",
             colnames(col_ann),
             "'></div> <span id = 'cell_",
             colnames(col_ann), "'>
             </span></br>", collapse = "")
    )


  # load jquery
  output_str <- paste0(
    "<head>
    <style>", metaheatmap::get_script("style.css"),"</style>
    <style>
      #cursor{
        width: ", block_width - grid_line_width,"px;
        height: ", block_width - grid_line_width,"px;
      }
      #cell_cursor{
        width: ", block_width - grid_line_width,"px;
        height: ",cmd_height - padding,"px;
      }
      #gene_cursor{
        width: ", gmd_width - padding,"px;
        height: ", block_width - grid_line_width, "px;
      }
    </style>
    <script>", metaheatmap::get_script("jquery-3.3.1.min.js"),"</script>
    <script>
      var gw = ", block_width, ";
      var m = ", matrix_to_js_array(R), ";
      var cmd = ", RJSONIO::toJSON(col_ann),";
      var gmd = ", RJSONIO::toJSON(row_ann),";
      var gene_names = ", RJSONIO::toJSON(rownames(R)),";
      var cell_names = ", RJSONIO::toJSON(colnames(R)),";
      var annotation_colors = ",  RJSONIO::toJSON(annotation_colors), ";
      var grid_line_width = ", grid_line_width,";
      var gmd_width =", gmd_width, ";
    </script>")

  output_str <- paste0(output_str, "
  <script>", metaheatmap::get_script("colors.js"),"</script>
  <script>", metaheatmap::get_script("myscripts.js"),"</script>
  <script>", metaheatmap::get_script("draggable.js"),"</script>
  </head>
  <body>
  <div>
    <div id='heatmap_container'
      style = '
        left:", gmd_width, "px;
        top:", cmd_height,"px;
        width:", heatmap_width + 500,"px;
        height:", heatmap_height + 500,"px;
      '>
      <canvas id='heatmap'
        width='", heatmap_width, "'
        height='", heatmap_height,"'>
      </canvas>
    </div>
    <div id = 'cmd_container' style = 'left:", gmd_width, "px; top:0'>
      <canvas id='cell_meta_data'
        width = '", cmd_width, "'
        height = '", cmd_height,"
      '></canvas>
    </div>
    <div id = 'gmd_container' style = 'top:", cmd_height,"px; left:0'>
      <canvas id='gene_meta_data'
        width = '", gmd_width, "'
        height = '", gmd_height,"'>
      </canvas>
    </div>
    <div id = 'white_rectangle' style = '
      top:0;
      left:0;
      width: ", gmd_width,"px;
      height: ", cmd_height,"px
    '>
    </div>
    </div>
    <table id = 'additional_info'
      style = '
        top : ", cmd_height + heatmap_height,"px;
        left : ", gmd_width, "px;
        position : absolute
      '>
      <tr>
        <th>Expression color legend</th>
        <th>
          <button
            type = 'button'
            onclick = 'reset_heatmap()'>
              Reset
          </button>
        </th>
        <th>Genes</th>
        <th>Cells</th>
      <tr>
      <tr>
        <td id = 'expression_color_legend'>
        </td>
        <td></td>
        <td>
          <textarea id='gene_list' rows='5'></textarea>
        </td>
        <td>
          <textarea id='cell_list' rows='5'></textarea>
        </td>
      </tr>
    </table>
    <div id ='cursor'></div>
    <div id ='cell_cursor'></div>
    <div id ='gene_cursor'></div>
    <div id ='infobox'>", infobox_html, "</div>
    <div id ='gmd_names' style = '
      line-height : ", 3*block_width ,"px;
      font-size : ", 3*block_width ,"px'>
      ", paste0(colnames(row_ann), collapse = "</br>") , "
    </div>
    <div id ='cmd_names' style = '
      line-height : ", 3*block_width ,"px;
      font-size : ", 3*block_width ,"px'>
      ", paste0(colnames(col_ann), collapse = "</br>") , "
    </div>
  </body>
  </html>
  ")
  writeLines(output_str, fileConn)
  close(fileConn)
}


