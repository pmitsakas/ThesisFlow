exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_ONLY',
        message: 'This action requires admin privileges'
      }
    });
  }
  next();
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'STUDENT_ONLY',
        message: 'This action is only available to students'
      }
    });
  }
  next();
};

exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TEACHER_ONLY',
        message: 'This action is only available to teachers'
      }
    });
  }
  next();
};

exports.isStudentOrTeacher = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'This action is only available to students and teachers'
      }
    });
  }
  next();
};

exports.isTeacherOrAdmin = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'This action is only available to teachers and administrators'
      }
    });
  }
  next();
};