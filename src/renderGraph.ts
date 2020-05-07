//import Dygraph from './node_modules/dygraphs/dist/dygraphs.js';
declare const Dygraph: any;

export function renderGraph(depNumber: string) {
  new Dygraph(
    // containing div
    document.getElementById('graphdiv'),
    // 'assets/datasources/par_origin_test.csv'
    `assets/datasources/par_origin_agg_${depNumber}.csv`,
    // // CSV or path to a CSV file.
    // "Date,Temperature\n" +
    // "2008-05-07,75\n" +
    // "2008-05-08,70\n" +
    // "2008-05-09,80\n",
    {
      legend: 'always',
      logscale: false,
      title: 'Nuitées',
      underlayCallback: function(
        canvas: {
          fillStyle: string;
          fillRect: (arg0: any, arg1: any, arg2: number, arg3: any) => void;
        },
        area: {
          y: any;
          h: any;
        },
        g: {
          toDomXCoord: (arg0: any) => any;
          getValue: (arg0: number, arg1: number) => any;
          numRows: () => number;
        }
      ) {
        canvas.fillStyle = 'peachpuff';
        function highlight_period(x_start: Date, x_end: Date) {
          // shift back due to TZ
          x_start = new Date(
            new Date(x_start).getTime() + new Date(x_start).getTimezoneOffset()
          );
          x_end = new Date(
            new Date(x_end).getTime() + new Date(x_end).getTimezoneOffset()
          );
          const dateStart = new Date(x_start);
          x_start = new Date(
            dateStart.getFullYear(),
            dateStart.getMonth(),
            dateStart.getDate()
          );
          const dateEnd = new Date(x_end);
          x_end = new Date(
            dateEnd.getFullYear(),
            dateEnd.getMonth(),
            dateEnd.getDate()
          );
          var canvas_left_x = g.toDomXCoord(x_start);
          var canvas_right_x = g.toDomXCoord(x_end);
          var canvas_width = canvas_right_x - canvas_left_x;
          canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
        }
        var min_data_x = g.getValue(0, 0);
        var max_data_x = g.getValue(g.numRows() - 1, 0);
        // get day of week
        var d = new Date(min_data_x);
        var dow = d.getUTCDay();
        var w = min_data_x;
        // starting on Sunday is a special case
        if (dow === 0) {
          highlight_period(w, w + 12 * 3600 * 1000);
        }
        // find first saturday
        while (dow != 6) {
          w += 24 * 3600 * 1000;
          d = new Date(w);
          dow = d.getUTCDay();
        }
        while (w < max_data_x) {
          var start_x_highlight = w;
          var end_x_highlight = w + 2 * 24 * 3600 * 1000;
          // make sure we don't try to plot outside the graph
          if (start_x_highlight < min_data_x) {
            start_x_highlight = min_data_x;
          }
          if (end_x_highlight > max_data_x) {
            end_x_highlight = max_data_x;
          }
          highlight_period(start_x_highlight, end_x_highlight);
          // calculate start of highlight for next Saturday
          w += 7 * 24 * 3600 * 1000;
        }
      }
    }
  );
}
