const pool = require('../config/database');
const { encryptPassword } = require('../utils/encryption');

class User {
  constructor(data) {
    //console.log('Datos recibidos en el constructor:', data);
    this.id = data.id;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.email = data.email;
    this.password = data.password;
    this.tipo_documento = data.tipo_documento; // Ajustado
    this.numero_documento = data.numero_documento; // Ajustado
    this.genero = data.genero;
    this.telefono = data.telefono;
    this.fecha_nacimiento = data.fecha_nacimiento; // Ajustado
    this.rol = data.rol;
  }
  static async create(userData) {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await encryptPassword(userData.password);
      console.log('Contraseña encriptada:', hashedPassword);
      
      const [result] = await connection.query(
        `INSERT INTO users (
          nombres, apellidos, tipo_documento, numero_documento, 
          genero, email, telefono, rol, fecha_nacimiento, 
          password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.nombres,
          userData.apellidos,
          userData.tipo_documento,
          userData.numero_documento,
          userData.genero,
          userData.email,
          userData.telefono,
          userData.rol || 'USER',
          userData.fecha_nacimiento,
          hashedPassword
        ]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Resultado de la consulta:', rows[0]);
    if (rows.length > 0) {
      return new User(rows[0]);
    }
    return null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND estado = true',
      [id]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `UPDATE users SET 
          nombres = ?,
          apellidos = ?,
          tipo_documento = ?,
          numero_documento = ?,
          genero = ?,
          email = ?,
          telefono = ?,
          fecha_nacimiento = ?
        WHERE id = ? AND estado = true`,
        [
          userData.nombres,
          userData.apellidos,
          userData.tipoDocumento,
          userData.numeroDocumento,
          userData.genero,
          userData.email,
          userData.telefono,
          userData.fechaNacimiento,
          id
        ]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async deactivate(id) {
    const [result] = await pool.query(
      'UPDATE users SET estado = false WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async list() {
    const [rows] = await pool.query('SELECT * FROM users WHERE estado = true');
    return rows;
  }
}

module.exports = User;