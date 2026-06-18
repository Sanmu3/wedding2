(function () {
  "use strict";

  // Fungsi mekanis scroll interaktif bolak-balik (PC & HP)
  var inisialisasiAmplopScrollKinetik = function () {
    var scrollProgress = 0; // Angka progres dari 0 (tertutup) sampai 100 (terbuka penuh)
    var maxProgress = 100;
    var touchStartY = 0;

    // Fungsi untuk mengupdate visual amplop berdasarkan progres angka
    function updateEnvelope() {
      // 1. Logika Flap (Buka dari 0 derajat sampai maksimal 180 derajat)
      // Flap bergerak di paruh pertama scroll (progres 0 - 50)
      var flapRotation = 0;
      if (scrollProgress <= 50) {
        flapRotation = (scrollProgress / 50) * 180;
        $(".flap").css("z-index", "4");
      } else {
        flapRotation = 180;
        $(".flap").css("z-index", "1"); // Sembunyikan flap di belakang kertas saat surat naik
      }
      $(".flap").css("transform", `rotateX(${flapRotation}deg)`);

      // 2. Logika Surat Meluncur (Bergerak di paruh kedua scroll, progres 30 - 100)
      var letterY = 0;
      if (scrollProgress > 30) {
        // Menghitung perpindahan dari progres 30 ke 100 menjadi translasi Y
        var factor = (scrollProgress - 30) / (maxProgress - 30);
        letterY = factor * -170; // <--- Diubah dari -140 menjadi -210 agar surat naik lebih tinggi
      } else {
        letterY = 0;
      }
      $(".letter").css("transform", `translateY(${letterY}px)`);

      // 3. Hilangkan petunjuk scroll perlahan jika user sudah mulai mencoba mengulik scroll
      if (scrollProgress > 15) {
        $(".scroll-hint").fadeOut("fast");
      } else {
        $(".scroll-hint").fadeIn("fast");
      }
    }

    // --- KONTROL UNTUK MOUSE / TRACKPAD LAPTOP (PC) ---
    $("#overlay").on("wheel", function (e) {
      e.preventDefault(); // Mencegah hentakan bawaan browser
      if (e.originalEvent.deltaY > 0) {
        // Scroll ke bawah -> Naikkan progres
        scrollProgress = Math.min(maxProgress, scrollProgress + 5);
      } else {
        // Scroll ke atas -> Turunkan progres
        scrollProgress = Math.max(0, scrollProgress - 5);
      }
      updateEnvelope();
    });

    // --- KONTROL UNTUK LAYAR SENTUH / SWIPE (HP) ---
    $("#overlay").on("touchstart", function (e) {
      touchStartY = e.originalEvent.touches[0].clientY;
    });

    $("#overlay").on("touchmove", function (e) {
      var touchCurrentY = e.originalEvent.touches[0].clientY;
      var deltaY = touchStartY - touchCurrentY; // Menghitung jarak gesekan jari

      if (Math.abs(deltaY) > 5) {
        // Sensitivitas threshold geseran
        if (deltaY > 0) {
          // Usap ke atas (Scroll ke bawah) -> Buka amplop
          scrollProgress = Math.min(maxProgress, scrollProgress + 3);
        } else {
          // Usap ke bawah (Scroll ke atas) -> Tutup amplop
          scrollProgress = Math.max(0, scrollProgress - 3);
        }
        updateEnvelope();
        touchStartY = touchCurrentY; // Set ulang titik acuan biar presisi real-time
      }
    });
  };

  // Fungsi utama ketika tombol "Buka Undangan" diklik
  var bukaUndangan = function () {
    // Tambahkan transisi memudar pada overlay utama
    $("#overlay").addClass("hide-overlay");

    // Jalankan audio setelah dibuka
    if (typeof playAudio1 === "function") {
      playAudio1();
    }

    // Jalankan Animasi floating button bawaan template abang
    var c = document.getElementsByClassName("right-sidebar");
    for (var i = 0; i < c.length; i++) {
      c[i].classList.add("animate");
    }
  };

  var mobileMenuOutsideClick = function () {
    $(document).click(function (e) {
      var container = $("#fh5co-offcanvas, .js-fh5co-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($("body").hasClass("offcanvas")) {
          $("body").removeClass("offcanvas");
          $(".js-fh5co-nav-toggle").removeClass("active");
        }
      }
    });
  };

  var offcanvasMenu = function () {
    $("#page").prepend('<div id="fh5co-offcanvas" />');
    var clone1 = $(".menu-1 > ul").clone();
    $("#fh5co-offcanvas").append(clone1);
    var clone2 = $(".menu-2 > ul").clone();
    $("#fh5co-offcanvas").append(clone2);

    $("#fh5co-offcanvas .has-dropdown").addClass("offcanvas-has-dropdown");
    $("#fh5co-offcanvas").find("li").removeClass("has-dropdown");

    $(".offcanvas-has-dropdown")
      .mouseenter(function () {
        var $this = $(this);
        $this.addClass("active").find("ul").slideDown(500, "easeOutExpo");
      })
      .mouseleave(function () {
        var $this = $(this);
        $this.removeClass("active").find("ul").slideUp(500, "easeOutExpo");
      });

    $(window).resize(function () {
      if ($("body").hasClass("offcanvas")) {
        $("body").removeClass("offcanvas");
        $(".js-fh5co-nav-toggle").removeClass("active");
      }
    });
  };

  var burgerMenu = function () {
    $("body").on("click", ".js-fh5co-nav-toggle", function (event) {
      var $this = $(this);
      if ($("body").hasClass("overflow offcanvas")) {
        $("body").removeClass("overflow offcanvas");
      } else {
        $("body").addClass("overflow offcanvas");
      }
      $this.toggleClass("active");
      event.preventDefault();
    });
  };

  var contentWayPoint = function () {
    var i = 0;
    $(".animate-box").waypoint(
      function (direction) {
        if (
          direction === "down" &&
          !$(this.element).hasClass("animated-fast")
        ) {
          i++;
          $(this.element).addClass("item-animate");
          setTimeout(function () {
            $("body .animate-box.item-animate").each(function (k) {
              var el = $(this);
              setTimeout(
                function () {
                  var effect = el.data("animate-effect");
                  if (effect === "fadeIn") {
                    el.addClass("fadeIn animated-fast");
                  } else if (effect === "fadeInLeft") {
                    el.addClass("fadeInLeft animated-fast");
                  } else if (effect === "fadeInRight") {
                    el.addClass("fadeInRight animated-fast");
                  } else {
                    el.addClass("fadeInUp animated-fast");
                  }
                  el.removeClass("item-animate");
                },
                k * 200,
                "easeInOutExpo"
              );
            });
          }, 100);
        }
      },
      { offset: "85%" }
    );
  };

  var dropdown = function () {
    $(".has-dropdown")
      .mouseenter(function () {
        var $this = $(this);
        $this
          .find(".dropdown")
          .css("display", "block")
          .addClass("animated-fast fadeInUpMenu");
      })
      .mouseleave(function () {
        var $this = $(this);
        $this
          .find(".dropdown")
          .css("display", "none")
          .removeClass("animated-fast fadeInUpMenu");
      });
  };

  var testimonialCarousel = function () {
    var owl = $(".owl-carousel-fullwidth");
    owl.owlCarousel({
      items: 1,
      loop: true,
      margin: 0,
      responsiveClass: true,
      nav: false,
      dots: true,
      smartSpeed: 800,
      autoHeight: true,
    });
  };

  var goToTop = function () {
    $(".js-gotop").on("click", function (event) {
      event.preventDefault();
      $("html, body").animate(
        { scrollTop: $("html").offset().top },
        500,
        "easeInOutExpo"
      );
      return false;
    });
    $(window).scroll(function () {
      var $win = $(window);
      if (!isMobileDevice()) {
        if ($win.scrollTop() > 200) {
          $(".js-top").addClass("active");
        } else {
          $(".js-top").removeClass("active");
        }
      }
    });
  };

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  var loaderPage = function () {
    $(".fh5co-loader").fadeOut("slow");
  };

  var counter = function () {
    $(".js-counter").countTo({
      formatter: function (value, options) {
        return value.toFixed(options.decimals);
      },
    });
  };

  var counterWayPoint = function () {
    if ($("#fh5co-counter").length > 0) {
      $("#fh5co-counter").waypoint(
        function (direction) {
          if (direction === "down" && !$(this.element).hasClass("animated")) {
            setTimeout(counter, 400);
            $(this.element).addClass("animated");
          }
        },
        { offset: "90%" }
      );
    }
  };

  var parallax = function () {
    if (typeof $(window).stellar === "function") {
      $(window).stellar();
    }
  };

  $(function () {
    mobileMenuOutsideClick();
    parallax();
    offcanvasMenu();
    burgerMenu();
    contentWayPoint();
    dropdown();
    testimonialCarousel();
    goToTop();
    loaderPage();
    counter();
    counterWayPoint();

    // Pemicu animasi lewat gerakan scroll (PC & HP)
    inisialisasiAmplopScrollKinetik();

    // Ketika tombol di dalam kertas surat diklik
    $("#open-invitation").on("click", function (e) {
      e.preventDefault();
      bukaUndangan();
    });
  });
})();
