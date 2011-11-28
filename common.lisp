(defmacro define-url-fn ((name) &body body)
  "Создание и регистрация функции обработчика в диспатчер"
  `(progn (defun ,name ()
	    (no-cache)
	    (setf (hunchentoot:content-type*) "text/html; charset=utf-8")
	    (handler-case
		(with-html-output (*standard-output* nil :prologue nil) ,@body)
	      (request-processing-error (err)
		(with-html-output (*standard-output* nil :prologue nil)
		  (str (format nil "{status : \"error\", error : \"~a\"}" (text err)))))
	      )
	    )
	  (push
	   (create-prefix-dispatcher ,(format nil "/~(~a~)" name) ',name) *dispatch-table*)))

(defun .qprint-encode/utf-8 (string)
  (qprint:encode (map 'string
                      'code-char
                      (trivial-utf-8:string-to-utf-8-bytes string))))

(defun encrypt (stuff)
  "Возращает хеш переданной строки"
  (ironclad:byte-array-to-hex-string 
   (ironclad:digest-sequence
    :sha1 (flexi-streams:string-to-octets stuff)))
  )


(defun cpBytesStreamToFile (input filepath len)
  (with-open-file (output filepath
			      :direction :output :if-exists :overwrite
			      :if-does-not-exist :create :element-type 'unsigned-byte )
    (dotimes (counter len)
      (write-byte (read-byte input) output)
      ))
  )

(defun make-utf8-string (input)
    "Из строки внутреннего представления сделает настоящий utf8"
  (flexi-streams:octets-to-string (trivial-utf-8:string-to-utf-8-bytes input)))


(defun defered-rm-file (path timeout)
  "Отложенное на timeout удаление файла"
  (timer:schedule-timer
   (timer:make-timer
    #'(lambda ()
	(when (probe-file path)
	  (delete-file path)
	  )))
   (+ (get-universal-time) timeout))
  )