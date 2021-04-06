var normalize_array = function(x){
  var Max = Math.max(...x);
  var Min = Math.min(...x);
  return x.map(y=> (y- Min)/(Max-Min));
};

var transformMatrix = function(m,f){
  return(m.map(x => x.map(f)))
};


var get_legend_block = function(hex_color){
  return(
    "<div class ='legend_block' " +
      "style = 'background-color: " + hex_color + "'>" +
    "</div>"
  )
};

var get_legends_for_continuous_variable = function(Min,Max,color_f){
  var Med = (Max + Min)/2;
  var Q3 = (3*Max + Min)/4;
  var Q1 = (Max + 3*Min)/4;
  return(
    get_legend_block(color_f(Max)) + String(Max) + "</br>" +
    get_legend_block(color_f(Q3)) + String(Q3) + "</br>" +
    get_legend_block(color_f(Med)) + String(Med) + "</br>" +
    get_legend_block(color_f(Q1)) + String(Q1) + "</br>" +
    get_legend_block(color_f(Min)) + String(Min)
  )
}

var gene_list = [];
var cell_list = [];
var n_cells = cell_names.length;
var n_genes = gene_names.length;
var cmd_keys = Object.keys(cmd);
var gmd_keys = Object.keys(gmd);

function jsonCopy(src) {
// Came from https://medium.com/@Farzad_YZ/3-ways-to-clone-objects-in-javascript-f752d148054d
  return JSON.parse(JSON.stringify(src));
}

var gmd_orig = jsonCopy(gmd);
var cmd_orig = jsonCopy(cmd);

// modify gmd and cmd so that they are color friendly
for(var k = 0; k < cmd_keys.length; k++){
  var ann_key = cmd_keys[k];
  if(typeof(cmd[ann_key][0]) == "number"){
    cmd[ann_key] = normalize_array(cmd[ann_key]);
  }
}

for(var k = 0; k < gmd_keys.length; k++){
  var ann_key = gmd_keys[k];
  if(typeof(gmd[ann_key][0]) == "number"){  
    gmd[ann_key] = normalize_array(gmd[ann_key]);
  }
}

var get_color_from_md = function(md, ann_key){
  switch(typeof(md)){
      case "number":
          return(
            mixColors(
              annotation_colors[ann_key][0], 
              annotation_colors[ann_key][1], 
              md
            )
          )    
      break;
    case "boolean":
      if(md){
        return("#000000");
      }else{
        return("#ffffff");
      } 
      break;
    default:
      return(annotation_colors[ann_key][md])
  }
}


$( document ).ready(function(){
  var Max = Math.max(...m.map(x => Math.max(...x)));
  var Min = Math.min(...m.map(x => Math.min(...x)));

  // hue function
  var hue_f = function(x){
    return Math.floor(240*(1-(x-Min)/ (Max - Min)));
  }

  // saturation function
  var sat_f = function(x){
    return Math.abs(2*(x - Min)/(Max-Min) - 1);
  };

  var hue = transformMatrix(m, hue_f)

  var sat = transformMatrix(m, sat_f)
  
  // Draw the heatmap
  var canvas = document.getElementById("heatmap");
  var ctx = canvas.getContext("2d");
  for(var i = 0; i < m.length; i++){
    for(var j = 0; j < m[0].length; j++){
      ctx.fillStyle = hsv2rgb(hue[i][j], sat[i][j], 1);
      ctx.fillRect(gw*j,gw*i, gw-grid_line_width,gw-grid_line_width);
    }
  }


  // Draw the expression color legend
  var legend = document.getElementById("expression_color_legend");
  legend.innerHTML =
    get_legends_for_continuous_variable(Min,Max,
      function(x){
        return hsv2rgb(hue_f(x), sat_f(x), 1)
      });



  // Draw the gene meta data
  var canvas = document.getElementById("gene_meta_data");
  var ctx = canvas.getContext("2d");
  for(var j = 0; j < gmd_keys.length; j++){
    var ann_key = gmd_keys[j]
    for(var i = 0; i < gmd[ann_key].length; i++){
      ctx.fillStyle = get_color_from_md(gmd[ann_key][i], ann_key)
      ctx.fillRect(j*(3*gw), gw*i, 2*gw-grid_line_width,gw-grid_line_width);
    }
  }
  


  // Draw the cell meta data
  var canvas = document.getElementById("cell_meta_data");
  var ctx = canvas.getContext("2d");
  for(var j = 0; j < cmd_keys.length; j++){
    var ann_key = cmd_keys[j]
    for(var i = 0; i < cmd[ann_key].length; i++){
      ctx.fillStyle = get_color_from_md(cmd[ann_key][i], ann_key)
      ctx.fillRect(gw*i, j*(3*gw), gw-grid_line_width, 2*gw-grid_line_width);
    }
  }
  
  
  var heatmap = document.getElementById('heatmap'); 
  var heatmap_container = document.getElementById('heatmap_container'); 
  var cursor = document.getElementById('cursor'); 
  var cell_cursor = document.getElementById('cell_cursor'); 
  var gene_cursor = document.getElementById('gene_cursor'); 
  var infobox = document.getElementById('infobox'); 

  var dragbox; // This is a div that will be created by heatmap.onmousedown
  
  var heatmap_Left = parseInt(heatmap_container.style.left);
  var heatmap_Top = parseInt(heatmap_container.style.top);


  update_dragbox = function(dragbox,i_start,j_start, i_stop, j_stop){
    var i1 = Math.min(i_start, i_stop);
    var i2 = Math.max(i_start, i_stop);
    var j1 = Math.min(j_start, j_stop);
    var j2 = Math.max(j_start, j_stop);
    
    dragbox.style.left = gw*j1 + heatmap_Left;
    dragbox.style.width = gw*(j2-j1+1) - grid_line_width;
    dragbox.style.top = gw*i1 + heatmap_Top;
    dragbox.style.height = gw*(i2-i1+1) - grid_line_width;
    return;
  }

  var i_start;
  var i_stop;
  var j_start;
  var j_stop;
  var heatmap_clicked = false;

  heatmap.onmousedown = function(e){
    heatmap_clicked = true;
    var x = e.pageX - heatmap_Left; 
    var y = e.pageY - heatmap_Top; 
    i_start = Math.floor(y/gw);
    j_start = Math.floor(x/gw);

    dragbox = document.createElement('div');
    dragbox.classList.add("dragbox")
    document.body.appendChild(dragbox);
      
    update_dragbox(dragbox, i_start, j_start, i_start, j_start);
  }

  heatmap.onmouseup = function(e){
    if(heatmap_clicked){
      heatmap_clicked = false;
      var x = e.pageX - heatmap_Left; 
      var y = e.pageY - heatmap_Top; 
      i_stop = Math.floor(y/gw);
      j_stop = Math.floor(x/gw);

      var i1 = Math.min(i_start, i_stop);
      var i2 = Math.max(i_start, i_stop);
      var j1 = Math.min(j_start, j_stop);
      var j2 = Math.max(j_start, j_stop);
      
      for(var i = i1; i <= i2; i++){
        if(gene_list.indexOf(i) == -1 & i < n_genes){
          gene_list.push(i)
          document.getElementById("gene_list").
            value += gene_names[i] +"\n";
        }
      }

      for(var j = j1; j <= j2; j++){
        if(cell_list.indexOf(j) == -1 & j < n_cells){
          cell_list.push(j)
          document.getElementById("cell_list").
            value += cell_names[j] +"\n";
        }
      }
    }
  }


  heatmap.onmousemove = function(e) { 
    var x = e.pageX - heatmap_Left; 
    var y = e.pageY - heatmap_Top; 
    var i = Math.floor(y/gw);
    var j = Math.floor(x/gw);
    
    cursor.style.left = gw*j + heatmap_Left;
    cursor.style.top = gw*i + heatmap_Top;
    cell_cursor.style.left = gw*j + heatmap_Left;
    gene_cursor.style.top = gw*i + heatmap_Top;
    infobox.style.left = gw*(j + 5)+heatmap_Left;
    infobox.style.top = gw*(i + 5)+heatmap_Top;

    document.getElementById('gene_name').innerHTML = gene_names[i];
    for(var k = 0; k < gmd_keys.length; k++){
      var ann_key = gmd_keys[k]
      document.getElementById('gene_'+ann_key).innerHTML =  gmd_orig[ann_key][i];
      document.getElementById('gene_legend_'+ann_key).style.backgroundColor = 
        get_color_from_md(gmd[ann_key][i], ann_key);
    }

    document.getElementById('cell_name').innerHTML = cell_names[j];
    for(var k = 0; k < cmd_keys.length; k++){
      var ann_key = cmd_keys[k]
      document.getElementById('cell_'+ann_key).innerHTML =  cmd_orig[ann_key][j];
      document.getElementById('cell_legend_'+ann_key).style.backgroundColor = 
        get_color_from_md(cmd[ann_key][j], ann_key);;
    }

    if(heatmap_clicked){
      update_dragbox(dragbox, i_start, j_start, i, j);
    }      
    
  }

  heatmap.onmouseout = function(e){
    cursor.style.display = "none";
    cell_cursor.style.display = "none";
    gene_cursor.style.display = "none";
    infobox.style.display = "none";
  }
  heatmap.onmouseenter = function(e){
    cursor.style.display = "inline";
    cell_cursor.style.display = "inline";
    gene_cursor.style.display = "inline";
    infobox.style.display = "inline";
  }


  


  dragElementY(document.getElementById("gmd_names"));
  dragElementX(document.getElementById("cmd_names"));
  
});


reset_heatmap = function(){
  // Empty the gene and cell lists
  gene_list = [];
  document.getElementById("gene_list").
    value = "";
  cell_list = [];
  document.getElementById("cell_list").
    value = "";

  // Delete all the dragboxes
  var paras = document.getElementsByClassName('dragbox');

  while(paras[0]) {
      paras[0].parentNode.removeChild(paras[0]);
  }
    
}



// Making the meta data stay where they are
// Taken from https://stackoverflow.com/a/8676457/636276
$(window).scroll(function(){
  $('#gmd_container').css({
      'left': $(this).scrollLeft()
  });
  
  $('#cmd_container').css({
      'top': $(this).scrollTop() 
  });

  $('#gene_cursor').css({
      'left': $(this).scrollLeft()
  });
    
  $('#cell_cursor').css({
      'top': $(this).scrollTop() 
  });
  
/*
  $('#additional_info').css({
        'left': $(this).scrollLeft() + gmd_width
    });*/
  
});

